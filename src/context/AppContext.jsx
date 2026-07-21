import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';

const AppContext = createContext();
const socket = io(); // Conecta no mesmo host da aplicação

export function AppProvider({ children }) {
  // Global State
  const [estoque, setEstoque] = useState([]);
  const [veiculos, setVeiculos] = useState([]);
  const [vendasHistorico, setVendasHistorico] = useState([]);
  const [pedidosHistorico, setPedidosHistorico] = useState([]);
  const [orcamentos, setOrcamentos] = useState([]);
  const [metricas, setMetricas] = useState({ valorCaixa: 0, vendasHoje: 0 });
  const [currentUser, setCurrentUser] = useState(null);
  const [usuarios, setUsuarios] = useState([]);
  const [logs, setLogs] = useState([]);
  const [pdvCart, setPdvCart] = useState([]); // Shared cart between PDV and Estoque

  const addToPdvCart = (item, qtd = 1) => {
    setPdvCart(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) {
        return prev.map(i => i.id === item.id ? { ...i, qtd: i.qtd + qtd } : i);
      }
      return [...prev, { ...item, qtd }];
    });
  };

  // Funções de Busca (Fetch)
  const fetchEstoque = useCallback(() => {
    fetch('/api/pecas').then(res => res.json()).then(data => setEstoque(data)).catch(console.error);
  }, []);

  const fetchVeiculos = useCallback(() => {
    fetch('/api/veiculos').then(res => res.json()).then(data => setVeiculos(data)).catch(console.error);
  }, []);

  const fetchVendas = useCallback(() => {
    fetch('/api/vendas').then(res => res.json()).then(data => {
      // Sort vendas mostly recent first
      const sorted = data.sort((a,b) => new Date(b.data) - new Date(a.data));
      setVendasHistorico(sorted);
      
      // Calculate Metrics
      const hoje = new Date().toISOString().split('T')[0];
      const vendasHoje = sorted.filter(v => v.data.startsWith(hoje)).length;
      const valorCaixa = sorted.reduce((acc, v) => acc + v.total, 0);
      setMetricas({ valorCaixa, vendasHoje });
    }).catch(console.error);
  }, []);

  const fetchUsuarios = useCallback(() => {
    fetch('/api/usuarios').then(res => res.json()).then(data => setUsuarios(data)).catch(console.error);
  }, []);

  const fetchPedidos = useCallback(() => {
    fetch('/api/pedidos').then(res => res.json()).then(data => setPedidosHistorico(data)).catch(console.error);
  }, []);

  const fetchOrcamentos = useCallback(() => {
    fetch(`/api/orcamentos?t=${Date.now()}`, { headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' } })
      .then(res => res.json())
      .then(data => setOrcamentos(data))
      .catch(console.error);
  }, []);

  // Load Initial Data e Inscrição nos Eventos do Socket
  useEffect(() => {
    fetchEstoque();
    fetchVeiculos();
    fetchVendas();
    fetchUsuarios();
    fetchPedidos();
    fetchOrcamentos();

    // Listeners em tempo real
    socket.on('refreshEstoque', fetchEstoque);
    socket.on('refreshVeiculos', fetchVeiculos);
    socket.on('refreshVendas', fetchVendas);
    socket.on('refreshUsuarios', fetchUsuarios);
    socket.on('refreshPedidos', fetchPedidos);
    socket.on('refreshOrcamentos', fetchOrcamentos);

    // Limpeza
    return () => {
      socket.off('refreshEstoque', fetchEstoque);
      socket.off('refreshVeiculos', fetchVeiculos);
      socket.off('refreshVendas', fetchVendas);
      socket.off('refreshUsuarios', fetchUsuarios);
      socket.off('refreshPedidos', fetchPedidos);
      socket.off('refreshOrcamentos', fetchOrcamentos);
    };
  }, [fetchEstoque, fetchVeiculos, fetchVendas, fetchUsuarios, fetchPedidos, fetchOrcamentos]);

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // Logout automático no fechamento da aba/F5
  useEffect(() => {
    const handleUnload = () => {
      if (currentUser?.username) {
        // navigator.sendBeacon com Blob para manter o Content-Type como application/json
        const blob = new Blob([JSON.stringify({ username: currentUser.username, beacon: true })], { type: 'application/json' });
        navigator.sendBeacon('/api/logout', blob);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [currentUser]);

  // --- AUTENTICAÇÃO ---
  const login = async (username, password) => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        showToast(`Bem-vindo, ${data.username}!`, 'success');
        return { success: true };
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Credenciais inválidas', 'error');
        return { success: false, message: errorData.error || 'Erro no login' };
      }
    } catch (e) {
      showToast('Erro ao conectar ao servidor', 'error');
      return { success: false, message: 'Servidor indisponível' };
    }
  }; /* FECHAMENTO DO LOGIN AQUI */

  const logout = async () => {
    if (currentUser) {
      try {
        await fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser.username })
        });
      } catch (e) {
        console.error('Logout error', e);
      }
    }
    setCurrentUser(null);
    showToast('Você saiu do sistema.', 'success');
  };

  // Helpers conectando com a API
  const addPeca = async (peca) => {
    try {
      const res = await fetch('/api/pecas', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': currentUser?.username }, body: JSON.stringify(peca)
      });
      if (res.ok) {
        const data = await res.json();
        setEstoque(prev => [data, ...prev]);
        showToast('Peça salva com sucesso no banco de dados!');
      } else {
        throw new Error('Falha ao salvar');
      }
    } catch (e) {
      showToast('Erro ao salvar peça no servidor.', 'error');
    }
  };

  const updatePeca = async (updatedPeca) => {
    try {
      const res = await fetch(`/api/pecas/${updatedPeca.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'X-Username': currentUser?.username }, body: JSON.stringify(updatedPeca)
      });
      if (res.ok) {
        const data = await res.json();
        setEstoque(prev => prev.map(p => p.id === data.id ? data : p));
        showToast('Peça atualizada!');
      }
    } catch (e) {
      showToast('Erro ao atualizar.', 'error');
    }
  };

  const deletePeca = async (id) => {
    try {
      const res = await fetch(`/api/pecas/${id}`, { method: 'DELETE', headers: { 'X-Username': currentUser?.username } });
      if (res.ok) {
        setEstoque(prev => prev.filter(p => p.id !== id));
        showToast('Peça excluída com sucesso.');
      }
    } catch (e) {
      showToast('Erro ao excluir.', 'error');
    }
  };
  
  const addVeiculo = async (v) => {
    try {
      const res = await fetch('/api/veiculos', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': currentUser?.username }, body: JSON.stringify(v)
      });
      if (res.ok) {
        const data = await res.json();
        setVeiculos(prev => [data, ...prev]);
        showToast('Veículo doador cadastrado!');
      }
    } catch (e) {
      showToast('Erro ao cadastrar veículo.', 'error');
    }
  };

  const finalizarVenda = async (carrinho, detalhes = {}) => {
    const subtotal = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
    const desconto = parseFloat(detalhes.desconto) || 0;
    const totalVenda = subtotal * (1 - (desconto / 100));
    
    const novoRecibo = {
      data: new Date().toISOString(),
      itens: carrinho.map(item => ({ id: item.id, nome: item.nome, qtd: item.qtd, preco: item.preco, subtotal: item.preco * item.qtd })),
      total: totalVenda,
      desconto: desconto,
      metodo: detalhes.metodoPagamento || 'Não especificado',
      cliente: detalhes.cliente || 'Consumidor Final',
      obs: detalhes.observacao || ''
    };

    try {
      const res = await fetch('/api/vendas', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Username': currentUser?.username }, body: JSON.stringify(novoRecibo)
      });

      if (res.ok) {
        const data = await res.json();
        setVendasHistorico(prev => [data, ...prev]);
        
        // Atualizar métricas localmente para feedback imediato
        setMetricas(prev => ({
          valorCaixa: prev.valorCaixa + totalVenda,
          vendasHoje: prev.vendasHoje + 1
        }));

        // Deduzir estoque localmente para feedback imediato (já foi reduzido no DB pela API)
        setEstoque(prev => prev.map(p => {
          const vendido = carrinho.find(c => c.id === p.id);
          if (vendido) {
            return { ...p, qtd: Math.max(0, p.qtd - vendido.qtd) };
          }
          return p;
        }));

        showToast(`Venda de R$ ${totalVenda.toFixed(2)} finalizada com sucesso!`);
      } else {
        throw new Error('Falha');
      }
    } catch (e) {
      showToast('Erro de conexão ao finalizar venda.', 'error');
    }
  };

  const deleteVenda = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta venda? O estoque dos itens será restaurado.')) return;
    try {
      const res = await fetch(`/api/vendas/${id}`, { method: 'DELETE', headers: { 'X-Username': currentUser?.username } });
      if (res.ok) {
        setVendasHistorico(prev => {
          const updated = prev.filter(v => (v._id || v.id) !== id);
          const hoje = new Date().toISOString().split('T')[0];
          const vendasHoje = updated.filter(v => v.data.startsWith(hoje)).length;
          const valorCaixa = updated.reduce((acc, v) => acc + v.total, 0);
          setMetricas({ valorCaixa, vendasHoje });
          return updated;
        });
        
        // Atualiza o estoque localmente para refletir o estorno
        fetch('/api/pecas').then(r => r.json()).then(data => setEstoque(data)).catch(console.error);

        showToast('Venda excluída com sucesso e estoque restaurado.');
      } else {
        const data = await res.json();
        showToast(data.error || 'Erro ao excluir venda.', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão ao excluir venda.', 'error');
    }
  };

  // (fetchUsuarios foi movido para o topo e implementado com useCallback)

  // Helpers de Pedidos
  const salvarPedido = async (pedido) => {
    try {
      const res = await fetch('/api/pedidos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pedido)
      });
      if (res.ok) {
        showToast('Pedido salvo/atualizado com sucesso!');
      } else {
        throw new Error('Falha');
      }
    } catch (e) {
      showToast('Erro ao salvar pedido no servidor.', 'error');
    }
  };

  const deletarPedido = async (idPersonalizado) => {
    try {
      const res = await fetch(`/api/pedidos/${idPersonalizado}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Pedido excluído com sucesso.');
      } else {
        throw new Error('Falha');
      }
    } catch (e) {
      showToast('Erro ao excluir pedido.', 'error');
    }
  };

  // Helpers de Orçamentos
  const salvarOrcamento = async (orcamento) => {
    try {
      const res = await fetch('/api/orcamentos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orcamento)
      });
      if (res.ok) {
        showToast('Orçamento criado com sucesso!');
        return await res.json();
      } else {
        throw new Error('Falha');
      }
    } catch (e) {
      showToast('Erro ao salvar orçamento.', 'error');
      return null;
    }
  };

  const atualizarOrcamento = async (id, dados) => {
    try {
      const res = await fetch(`/api/orcamentos/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados)
      });
      if (res.ok) {
        // Atualização otimista para não depender do websocket e ser instantâneo na tela
        setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, ...dados } : o));
        showToast('Orçamento atualizado!');
        return true;
      } else {
        throw new Error('Falha');
      }
    } catch (e) {
      showToast('Erro ao atualizar orçamento.', 'error');
      return false;
    }
  };

  const deletarOrcamento = async (id) => {
    try {
      const res = await fetch(`/api/orcamentos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Orçamento excluído com sucesso.');
      } else {
        throw new Error('Falha');
      }
    } catch (e) {
      showToast('Erro ao excluir orçamento.', 'error');
    }
  };

  // Helpers de Usuários
  const addUsuario = async (u) => {
    try {
      const res = await fetch('/api/usuarios', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(u)
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(prev => [data, ...prev]);
        showToast('Usuário criado com sucesso!');
      } else {
        const err = await res.json();
        showToast(err.error || 'Erro ao criar usuário', 'error');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    }
  };

  const updateUsuario = async (u) => {
    try {
      const res = await fetch(`/api/usuarios/${u.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(u)
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(prev => prev.map(user => user.id === data.id ? data : user));
        showToast('Usuário atualizado!');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    }
  };

  const deleteUsuario = async (id) => {
    try {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsuarios(prev => prev.filter(user => user.id !== id));
        showToast('Usuário excluído.');
      }
    } catch (e) {
      showToast('Erro de conexão', 'error');
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, logout,
      usuarios, fetchUsuarios, addUsuario, updateUsuario, deleteUsuario,
      logs, fetchLogs,
      estoque, addPeca, updatePeca, deletePeca,
      veiculos, addVeiculo,
      metricas, finalizarVenda, deleteVenda,
      vendasHistorico, setVendasHistorico,
      pedidosHistorico, salvarPedido, deletarPedido,
      orcamentos, salvarOrcamento, atualizarOrcamento, deletarOrcamento,
      pdvCart, setPdvCart, addToPdvCart,
      toastMessage, showToast
    }}>
      {children}
      
      {/* Global Toast Renderer */}
      {toastMessage && (
        <div style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 10000,
          backgroundColor: toastMessage.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)',
          color: '#fff', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)', fontWeight: 600,
          animation: 'slideIn 0.3s ease-out'
        }}>
          {toastMessage.message}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          `}} />
        </div>
      )}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
