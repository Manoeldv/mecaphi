import express from 'express';
import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']); // Fix for Windows DNS SRV ECONNREFUSED issues with MongoDB Atlas
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer } from 'http';
import { Server } from 'socket.io';

import Peca from './models/Peca.js';
import Veiculo from './models/Veiculo.js';
import Venda from './models/Venda.js';
import Usuario from './models/Usuario.js';
import Log from './models/Log.js';
import Pedido from './models/Pedido.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Permite acesso do front end
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir arquivos estáticos do React em produção
app.use(express.static(path.join(__dirname, '../dist')));

// Configurações do Mongoose para Produção
mongoose.set('strictQuery', false);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp');
    console.log('✅ Conectado ao MongoDB');
    // Chama o seed aqui em vez de depender de eventos
    seedUsers();
  } catch (err) {
    console.error('❌ Erro Crítico ao conectar no MongoDB:', err.message);
    if (err.message.includes('ECONNREFUSED') || err.message.includes('timed out')) {
      console.log('⚠️ DICA: Verifique se o seu IP está liberado no MongoDB Atlas (Security > Network Access > Allow 0.0.0.0/0).');
    }
    // Tenta reconectar em 10 segundos
    setTimeout(connectDB, 10000);
  }
};

connectDB();

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB desconectado. Tentando reconectar...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro de conexão do Mongoose:', err.message);
});

// Eventos do Socket
io.on('connection', (socket) => {
  console.log('🔌 Cliente conectado via WebSocket:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 Cliente desconectado:', socket.id);
  });
});

// --- SEED USERS ---
const seedUsers = async () => {
  try {
    const usersCount = await Usuario.countDocuments();
    if (usersCount === 0) {
      console.log('🌱 Semeando usuários iniciais...');
      await Usuario.create([
        { username: 'boss', password: '123', role: 'boss' },
        { username: 'balcao1', password: '123', role: 'balcao' },
        { username: 'balcao2', password: '123', role: 'balcao' }
      ]);
      console.log('✅ 3 Usuários criados com sucesso (boss, balcao1, balcao2). Senha padrão: 123');
    }
  } catch (err) {
    console.error('❌ Erro ao semear usuários:', err.message);
  }
};

// --- ROTA DE LOGIN ---
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await Usuario.findOne({ username });
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }
    
    // Simplificado para o MVP (Em produção usar bcrypt)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Senha incorreta' });
    }
    
    // Atualizar status e registrar log (não bloqueia a resposta)
    user.isOnline = true;
    user.lastLogin = new Date();
    
    Promise.all([
      user.save(),
      Log.create({
        usuario: user.username,
        acao: 'Login',
        detalhes: 'Entrou no sistema'
      })
    ]).catch(err => console.error('Erro ao atualizar log/status de login:', err));
    
    res.json({
      id: user._id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// --- ROTA DE LOGOUT ---
app.post('/api/logout', async (req, res) => {
  try {
    const { username } = req.body;
    if (username) {
      await Usuario.findOneAndUpdate(
        { username },
        { isOnline: false, lastLogout: new Date() }
      );
      
      await Log.create({
        usuario: username,
        acao: 'Logout',
        detalhes: 'Saiu do sistema'
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

// --- ROTA DE LOGS ---
app.get('/api/logs', async (req, res) => {
  try {
    const logs = await Log.find().sort({ createdAt: -1 }).limit(100);
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROTAS PEÇAS ---
app.get('/api/pecas', async (req, res) => {
  try {
    const pecas = await Peca.find().sort({ createdAt: -1 });
    // Convert _id to id for the frontend
    const formatted = pecas.map(p => {
      const obj = p.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pecas', async (req, res) => {
  try {
    const novaPeca = new Peca(req.body);
    await novaPeca.save();
    const obj = novaPeca.toObject();
    obj.id = obj._id.toString();

    const username = req.headers['x-username'];
    if (username) {
      await Log.create({
        usuario: username,
        acao: 'Cadastro de Peça',
        detalhes: `Cadastrou a peça: ${obj.nome} (Qtd: ${obj.qtd})`
      });
    }

    io.emit('refreshEstoque'); // Sincronização em tempo real
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/pecas/:id', async (req, res) => {
  try {
    const atualizada = await Peca.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!atualizada) return res.status(404).json({ error: 'Peça não encontrada' });
    const obj = atualizada.toObject();
    obj.id = obj._id.toString();

    const username = req.headers['x-username'];
    if (username) {
      await Log.create({
        usuario: username,
        acao: 'Atualização de Peça',
        detalhes: `Atualizou a peça: ${obj.nome}`
      });
    }

    io.emit('refreshEstoque'); // Sincronização em tempo real
    res.json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/pecas/:id', async (req, res) => {
  try {
    const peca = await Peca.findById(req.params.id);
    if (peca) {
      const nomePeca = peca.nome;
      await Peca.findByIdAndDelete(req.params.id);

      const username = req.headers['x-username'];
      if (username) {
        await Log.create({
          usuario: username,
          acao: 'Exclusão de Peça',
          detalhes: `Excluiu a peça: ${nomePeca}`
        });
      }
    }
    io.emit('refreshEstoque'); // Sincronização em tempo real
    res.json({ message: 'Peça removida com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROTAS VEÍCULOS ---
app.get('/api/veiculos', async (req, res) => {
  try {
    const veiculos = await Veiculo.find();
    const formatted = veiculos.map(v => {
      const obj = v.toObject();
      obj.id = obj._id.toString();
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/veiculos', async (req, res) => {
  try {
    const novoVeiculo = new Veiculo(req.body);
    await novoVeiculo.save();
    const obj = novoVeiculo.toObject();
    obj.id = obj._id.toString();

    const username = req.headers['x-username'];
    if (username) {
      await Log.create({
        usuario: username,
        acao: 'Cadastro de Veículo',
        detalhes: `Cadastrou o veículo doador: ${obj.marca} ${obj.modelo}`
      });
    }

    io.emit('refreshVeiculos'); // Sincronização em tempo real
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- ROTAS VENDAS ---
app.get('/api/vendas', async (req, res) => {
  try {
    const vendas = await Venda.find();
    res.json(vendas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/vendas', async (req, res) => {
  try {
    const novaVenda = new Venda(req.body);
    await novaVenda.save();
    
    // Atualizar estoque
    const { itens } = req.body;
    for (const item of itens) {
      if (item.id && mongoose.Types.ObjectId.isValid(item.id)) {
        await Peca.findByIdAndUpdate(item.id, {
          $inc: { qtd: -item.qtd }
        });
      }
    }
    
    const username = req.headers['x-username'];
    if (username) {
      await Log.create({
        usuario: username,
        acao: 'Venda Realizada',
        detalhes: `Realizou uma venda de R$ ${novaVenda.total.toFixed(2)} (Qtd Itens: ${itens.length})`
      });
    }

    io.emit('refreshVendas'); // Sincronização em tempo real das vendas
    io.emit('refreshEstoque'); // Sincronização em tempo real do estoque afetado
    res.status(201).json(novaVenda);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/vendas/:id', async (req, res) => {
  try {
    const venda = await Venda.findById(req.params.id);
    if (!venda) return res.status(404).json({ error: 'Venda não encontrada' });

    // Restaurar o estoque
    for (const item of venda.itens) {
      if (item.id && mongoose.Types.ObjectId.isValid(item.id)) {
        await Peca.findByIdAndUpdate(item.id, {
          $inc: { qtd: item.qtd }
        });
      }
    }

    await Venda.findByIdAndDelete(req.params.id);

    const username = req.headers['x-username'];
    if (username) {
      await Log.create({
        usuario: username,
        acao: 'Exclusão de Venda',
        detalhes: `Excluiu a venda de R$ ${venda.total.toFixed(2)}`
      });
    }

    io.emit('refreshVendas'); // Sincronização em tempo real
    io.emit('refreshEstoque'); // Sincronização em tempo real
    res.json({ message: 'Venda excluída e estoque restaurado.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROTAS PEDIDOS ---
app.get('/api/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.find().sort({ createdAt: -1 });
    const formatted = pedidos.map(p => {
      const obj = p.toObject();
      obj.id = obj.idPersonalizado; // Mapeia para o formato esperado pelo frontend
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/pedidos', async (req, res) => {
  try {
    // Se o pedido já existir pelo ID personalizado (ex: PED-123), atualiza
    let result;
    const existente = await Pedido.findOne({ idPersonalizado: req.body.id });
    
    const dataObj = {
      idPersonalizado: req.body.id,
      data: req.body.data,
      fornecedor: req.body.fornecedor,
      itens: req.body.itens
    };

    if (existente) {
      result = await Pedido.findOneAndUpdate({ idPersonalizado: req.body.id }, dataObj, { new: true });
    } else {
      const novoPedido = new Pedido(dataObj);
      result = await novoPedido.save();
    }
    
    const obj = result.toObject();
    obj.id = obj.idPersonalizado;
    
    io.emit('refreshPedidos'); // Sincronização em tempo real
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/pedidos/:idPersonalizado', async (req, res) => {
  try {
    await Pedido.findOneAndDelete({ idPersonalizado: req.params.idPersonalizado });
    io.emit('refreshPedidos'); // Sincronização em tempo real
    res.json({ message: 'Pedido excluído e estoque restaurado.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROTAS USUARIOS ---
app.get('/api/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    const formatted = usuarios.map(u => {
      const obj = u.toObject();
      obj.id = obj._id.toString();
      // Não removemos a senha do retorno aqui por ser um MVP sem JWT,
      // para facilitar a edição pelo boss, mas em prod isso seria filtrado.
      return obj;
    });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/usuarios', async (req, res) => {
  try {
    const novoUsuario = new Usuario(req.body);
    await novoUsuario.save();
    const obj = novoUsuario.toObject();
    obj.id = obj._id.toString();
    io.emit('refreshUsuarios'); // Sincronização
    res.status(201).json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/usuarios/:id', async (req, res) => {
  try {
    const atualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!atualizado) return res.status(404).json({ error: 'Usuário não encontrado' });
    const obj = atualizado.toObject();
    obj.id = obj._id.toString();
    io.emit('refreshUsuarios'); // Sincronização
    res.json(obj);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/usuarios/:id', async (req, res) => {
  try {
    await Usuario.findByIdAndDelete(req.params.id);
    io.emit('refreshUsuarios'); // Sincronização
    res.json({ message: 'Usuário removido' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- ROTA DE INTELIGÊNCIA ARTIFICIAL (VISÃO) ---
app.post('/api/search/vision', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Chave de API do Gemini não configurada no servidor.' });
    }
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Nenhuma imagem fornecida.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Você é um perito veterano em autopeças. Para garantir precisão máxima na identificação desta peça para o Mercado Livre, faça uma análise profunda antes de responder:\n1. Analise a geometria, os materiais visíveis (metal fundido, borracha, plástico), pontos de fixação, furos roscados, estrias e conexões (elétricas ou hidráulicas).\n2. Diferencie peças visualmente parecidas baseando-se na função mecânica deduzida (ex: componentes de vedação vs hidráulicos vs suspensão).\n3. NUNCA adivinhe o modelo do carro a menos que esteja escrito na peça.\n4. Inclua qualquer código (OEM), número ou marca legível (ex: 'Bosch', '33100-TBA').\n5. Retorne APENAS os termos de busca (o nome técnico mais exato da peça e seus códigos visíveis), sem nenhuma outra palavra ou explicação." },
            {
              inlineData: {
                data: base64Data,
                mimeType: 'image/jpeg'
              }
            }
          ]
        }
      ]
    });
    
    let aiSuggestion = '';
    try {
      if (response && response.text) {
        aiSuggestion = response.text;
      }
    } catch (err) {
      console.warn('Aviso: falha ao extrair texto da IA (possível bloqueio de segurança):', err.message);
      // Se tiver candidates mas não tiver texto, podemos olhar o finishReason
      if (response.candidates && response.candidates.length > 0) {
        console.warn('Finish reason:', response.candidates[0].finishReason);
      }
    }
    
    aiSuggestion = aiSuggestion.trim();
    
    if (!aiSuggestion) {
      return res.status(400).json({ error: 'A IA não conseguiu identificar a imagem ou foi bloqueada pelos filtros de segurança.' });
    }

    // Busca mais robusta: divide o nome da peça sugerida em palavras chaves e busca no banco
    const words = aiSuggestion.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 2);
    
    let query = {};
    if (words.length > 0) {
      // Busca qualquer peça que contenha ao menos uma das palavras-chave relevantes no nome
      const orConditions = words.map(w => ({ nome: new RegExp(w, 'i') }));
      query = { $or: orConditions };
    } else {
      query = { nome: new RegExp(aiSuggestion, 'i') };
    }

    const matchedParts = await Peca.find(query);

    const formatted = matchedParts.map(p => {
      const obj = p.toObject();
      obj.id = obj._id.toString();
      return obj;
    });

    res.json({
      suggestion: aiSuggestion,
      results: formatted
    });

  } catch (error) {
    console.error('Erro na IA:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fallback Route para React (SPA) - Sempre que uma rota não bater na API, enviar o front-end
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Erro Crítico Não Tratado:', err.stack);
  res.status(500).json({ error: 'Erro interno no servidor' });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor HTTP e Socket.IO rodando na porta ${PORT}`);
});

// Graceful Shutdown
const shutdown = async () => {
  console.log('🛑 Recebido sinal de desligamento. Fechando conexões...');
  await mongoose.connection.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
