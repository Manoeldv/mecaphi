import React, { useState, useEffect } from 'react';
import { PackageX, ShoppingCart, Plus, Trash2, Printer, ClipboardList, Search } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Pedidos() {
  const { estoque } = useAppContext();
  
  const [busca, setBusca] = useState('');
  
  // Mostra todo o catálogo que bate com a busca. Se não tiver busca, mostra todo o estoque (ordenado pelos esgotados primeiro).
  const catalogoFiltrado = busca.trim() !== '' 
    ? estoque.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.id.toLowerCase().includes(busca.toLowerCase()))
    : [...estoque].sort((a, b) => a.qtd - b.qtd);
  
  // Lista de itens que vão entrar no pedido de compra
  const [pedido, setPedido] = useState(() => {
    const saved = localStorage.getItem('pedidoAtual');
    return saved ? JSON.parse(saved) : [];
  });
  const [fornecedor, setFornecedor] = useState(() => {
    return localStorage.getItem('pedidoFornecedor') || '';
  });

  useEffect(() => {
    localStorage.setItem('pedidoAtual', JSON.stringify(pedido));
  }, [pedido]);

  useEffect(() => {
    localStorage.setItem('pedidoFornecedor', fornecedor);
  }, [fornecedor]);
  
  // Item Avulso
  const [avulsoNome, setAvulsoNome] = useState('');
  const [avulsoQtd, setAvulsoQtd] = useState(1);

  const addToPedido = (peca) => {
    if (!pedido.find(p => p.id === peca.id)) {
      setPedido([...pedido, { ...peca, qtdPedida: 5 }]); // default 5 units
    }
  };

  const removeFromPedido = (id) => {
    setPedido(pedido.filter(p => p.id !== id));
  };

  const updateQtd = (id, qtd) => {
    setPedido(pedido.map(p => p.id === id ? { ...p, qtdPedida: parseInt(qtd) || 1 } : p));
  };

  const addAllEsgotados = () => {
    const esgotados = catalogoFiltrado.filter(e => e.qtd === 0);
    const novos = esgotados.filter(e => !pedido.find(p => p.id === e.id)).map(e => ({ ...e, qtdPedida: 5 }));
    setPedido([...pedido, ...novos]);
  };

  const handleAddAvulso = (e) => {
    e.preventDefault();
    if (!avulsoNome.trim()) return;
    
    const novoItem = {
      id: `AV-${Date.now().toString().slice(-5)}`,
      nome: avulsoNome,
      oem: '-',
      qtdPedida: parseInt(avulsoQtd) || 1
    };
    
    setPedido([...pedido, novoItem]);
    setAvulsoNome('');
    setAvulsoQtd(1);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Cabeçalho */}
      <header className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={28} /> Reposição e Pedidos
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Gere orçamentos e pedidos de compra para suas peças esgotadas.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handlePrint} disabled={pedido.length === 0}>
            <Printer size={20} /> Gerar PDF do Pedido
          </button>
        </div>
      </header>

      {/* Cabeçalho Exclusivo de Impressão */}
      <div className="print-only" style={{ marginBottom: '2rem', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>AutoPeças ERP - Pedido de Compra / Cotação</h1>
        <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', marginTop: '1rem', fontSize: '14px', color: '#333' }}>
          <div>
            <strong>Data do Pedido:</strong> {new Date().toLocaleDateString('pt-BR')}<br/>
            <strong>Fornecedor/Observação:</strong> {fornecedor || 'A definir'}
          </div>
          <div style={{ textAlign: 'right' }}>
            <strong>Total de Itens:</strong> {pedido.length}<br/>
            <strong>Total de Peças:</strong> {pedido.reduce((acc, p) => acc + p.qtdPedida, 0)} un.
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        
        {/* Lado Esquerdo: Peças Esgotadas (Oculto na impressão) */}
        <div className="card no-print" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PackageX size={20} color="var(--color-danger)" /> Catálogo
            </h2>
            <button className="btn btn-outline" style={{ fontSize: '0.75rem', padding: '0.5rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} onClick={addAllEsgotados}>
              Adicionar Esgotados
            </button>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Buscar em todo o estoque..." 
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>

          <div style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            {busca.trim() === '' ? 'Mostrando todo o estoque (esgotados no topo):' : `Resultados para "${busca}":`}
          </div>

          {catalogoFiltrado.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <PackageX size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
              <p>Nenhuma peça encontrada.</p>
            </div>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '500px', overflowY: 'auto' }}>
              {catalogoFiltrado.map(peca => {
                const isAdded = pedido.find(p => p.id === peca.id);
                return (
                  <li key={peca.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', borderLeft: peca.qtd === 0 ? '4px solid var(--color-danger)' : '4px solid transparent' }}>
                    <div>
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {peca.nome}
                        {peca.qtd === 0 && <span style={{ fontSize: '0.65rem', backgroundColor: 'var(--color-danger)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>ESGOTADO</span>}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                        OEM: {peca.oem} | Em estoque: {peca.qtd}
                      </div>
                    </div>
                    <button 
                      className={`btn ${isAdded ? 'btn-outline' : 'btn-primary'}`} 
                      style={{ padding: '0.5rem' }}
                      onClick={() => isAdded ? removeFromPedido(peca.id) : addToPedido(peca)}
                    >
                      {isAdded ? <Trash2 size={16} color="var(--color-danger)" /> : <Plus size={16} />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Lado Direito: Lista do Pedido Atual */}
        <div className="card print-expand" style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 className="no-print" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShoppingCart size={20} color="var(--color-primary)" /> Lista de Encomenda
          </h2>

          <div className="no-print" style={{ marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Nome do Fornecedor ou Observação (Opcional)" 
              value={fornecedor}
              onChange={e => setFornecedor(e.target.value)}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
          </div>

          {/* Adicionar Item Avulso */}
          <form className="no-print" onSubmit={handleAddAvulso} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <input 
              type="text" 
              placeholder="Digitar item não cadastrado..." 
              value={avulsoNome}
              onChange={e => setAvulsoNome(e.target.value)}
              style={{ flex: 1, padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <input 
              type="number" 
              min="1"
              value={avulsoQtd}
              onChange={e => setAvulsoQtd(e.target.value)}
              style={{ width: '70px', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
            />
            <button type="submit" className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <Plus size={20} />
            </button>
          </form>

          {pedido.length === 0 ? (
            <div className="no-print" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p>Selecione as peças esgotadas ao lado para montar seu pedido de compra.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: 'var(--color-surface-hover)' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Peça / Descrição</th>
                    <th style={{ padding: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Cód. Original</th>
                    <th style={{ padding: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', width: '100px' }}>Qtd</th>
                    <th className="no-print" style={{ padding: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', width: '60px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {pedido.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600 }}>{item.nome}</div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>ID: {item.id}</div>
                      </td>
                      <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>{item.oem}</td>
                      <td style={{ padding: '0.75rem' }}>
                        {/* No PDF, mostramos apenas o número. Na tela, mostramos o input */}
                        <span className="print-only" style={{ fontWeight: 'bold' }}>{item.qtdPedida} un</span>
                        <input 
                          type="number" 
                          min="1"
                          className="no-print"
                          value={item.qtdPedida}
                          onChange={(e) => updateQtd(item.id, e.target.value)}
                          style={{ width: '70px', padding: '0.5rem' }}
                        />
                      </td>
                      <td className="no-print" style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button 
                          style={{ color: 'var(--color-danger)', padding: '0.5rem' }}
                          onClick={() => removeFromPedido(item.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
