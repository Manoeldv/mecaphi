import mongoose from 'mongoose';

const orcamentoSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  cliente: { type: String, default: '' },
  telefone: { type: String, default: '' },
  veiculo: { type: String, default: '' },
  itens: [{
    id: { type: String },
    nome: { type: String, required: true },
    qtd: { type: Number, default: 1 },
    preco: { type: Number, default: 0 }
  }],
  status: { 
    type: String, 
    enum: ['Pendente', 'Respondido', 'Aprovado', 'Rejeitado', 'Finalizado'],
    default: 'Pendente' 
  },
  observacoes: { type: String, default: '' },
  data: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Orcamento', orcamentoSchema);
