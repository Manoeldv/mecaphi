import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Send, CheckCircle } from 'lucide-react';

export default function OrcamentoForm() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  
  const [orcamento, setOrcamento] = useState(null);
  const [itens, setItens] = useState([]);
  
  // Novo item manual
  const [novoItemNome, setNovoItemNome] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState(1);

  // Informações do cliente
  const [cliente, setCliente] = useState('');
  const [telefone, setTelefone] = useState('');
  const [veiculo, setVeiculo] = useState('');

  useEffect(() => {
    fetch(`/api/orcamentos/public/${token}`)
      .then(res => {
        if (!res.ok) throw new Error('Link inválido ou expirado.');
        return res.json();
      })
      .then(data => {
        setOrcamento(data);
        setItens(data.itens || []);
        setCliente(data.cliente || '');
        setTelefone(data.telefone || '');
        setVeiculo(data.veiculo || '');
        
        if (data.status === 'Respondido' || data.status === 'Aprovado' || data.status === 'Finalizado') {
          setSucesso(true); // Se já foi respondido, apenas mostra sucesso
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!novoItemNome.trim()) return;
    
    setItens([
      ...itens, 
      { id: Date.now().toString(), nome: novoItemNome, qtd: parseInt(novoItemQtd) || 1 }
    ]);
    setNovoItemNome('');
    setNovoItemQtd(1);
  };

  const removerItem = (id) => {
    setItens(itens.filter(i => i.id !== id));
  };

  const updateQtd = (id, novaQtd) => {
    if (novaQtd < 1) return;
    setItens(itens.map(i => i.id === id ? { ...i, qtd: novaQtd } : i));
  };

  const handleSubmit = async () => {
    if (itens.length === 0) {
      alert('Adicione pelo menos uma peça à sua lista.');
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/orcamentos/public/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens, cliente, telefone, veiculo })
      });
      
      if (!res.ok) throw new Error('Erro ao enviar pedido.');
      
      setSucesso(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !orcamento) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-background)' }}>
        <p>Carregando formulário...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--color-background)' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>Ops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-background)', padding: '1rem' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: '500px', width: '100%' }}>
          <CheckCircle size={64} color="var(--color-success)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Lista Enviada!</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Recebemos a sua lista de peças com sucesso. Nossa equipe analisará o estoque e entrará em contato em breve com o orçamento.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={28} /> Solicitação de Peças
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            Preencha seus dados e adicione as peças que você precisa. Nossa loja responderá com a cotação.
          </p>
        </header>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            Seus Dados
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Seu Nome</label>
              <input 
                type="text" 
                value={cliente} 
                onChange={(e) => setCliente(e.target.value)} 
                placeholder="Ex: João da Silva"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>WhatsApp / Telefone</label>
              <input 
                type="text" 
                value={telefone} 
                onChange={(e) => setTelefone(e.target.value)} 
                placeholder="(00) 00000-0000"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Veículo (Opcional)</label>
              <input 
                type="text" 
                value={veiculo} 
                onChange={(e) => setVeiculo(e.target.value)} 
                placeholder="Ex: Gol G4 2008"
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
            Peças Desejadas
          </h2>

          <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <input 
              type="text" 
              placeholder="Qual peça você precisa? (Ex: Retrovisor)" 
              value={novoItemNome}
              onChange={e => setNovoItemNome(e.target.value)}
              style={{ flex: '1 1 200px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <input 
              type="number" 
              min="1"
              value={novoItemQtd}
              onChange={e => setNovoItemQtd(e.target.value)}
              style={{ width: '80px', flex: '0 0 80px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <button type="submit" className="btn btn-outline" style={{ padding: '0.75rem', flex: '0 0 auto' }}>
              <Plus size={20} /> Adicionar
            </button>
          </form>

          {itens.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
              Nenhuma peça adicionada ainda.
            </div>
          ) : (
            <>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {itens.map((item) => (
                  <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>
                        {item.nome}
                      </div>
                      {item.preco > 0 && (
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                          R$ {item.preco.toFixed(2)} / un
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <button type="button" onClick={() => updateQtd(item.id, item.qtd - 1)} style={{ padding: '0.2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><Minus size={16} /></button>
                        <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 'bold' }}>{item.qtd}</span>
                        <button type="button" onClick={() => updateQtd(item.id, item.qtd + 1)} style={{ padding: '0.2rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}><Plus size={16} /></button>
                      </div>
                      <button 
                        type="button"
                        style={{ color: 'var(--color-danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                        onClick={() => removerItem(item.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              
              {itens.some(i => i.preco > 0) && (
                <div style={{ marginTop: '1rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
                  <span style={{ fontWeight: 'bold' }}>Total Estimado:</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-primary)', fontSize: '1.25rem' }}>
                    R$ {itens.reduce((acc, item) => acc + ((item.preco || 0) * item.qtd), 0).toFixed(2)}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <button 
          className="btn btn-primary" 
          onClick={handleSubmit} 
          disabled={loading || itens.length === 0}
          style={{ width: '100%', marginTop: '1.5rem', padding: '1rem', fontSize: '1.125rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
        >
          {loading ? 'Enviando...' : <><Send size={20} /> Enviar Solicitação para a Loja</>}
        </button>

      </div>
    </div>
  );
}
