import React, { useState, useEffect } from 'react';
import { PackageX, ShoppingCart, Plus, Minus, Trash2, Printer, ClipboardList, Search, History, Save, Edit, FileText, X } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import OrcamentosView from './OrcamentosView';

export default function Pedidos() {
  const { estoque, pedidosHistorico, salvarPedido, deletarPedido } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('compras');
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

  const [pedidoAtivoId, setPedidoAtivoId] = useState(() => localStorage.getItem('pedidoAtivoId') || null);
  const [isSaved, setIsSaved] = useState(() => localStorage.getItem('pedidoIsSaved') === 'true');
  const [showHistorico, setShowHistorico] = useState(false);

  useEffect(() => {
    localStorage.setItem('pedidoAtual', JSON.stringify(pedido));
  }, [pedido]);

  useEffect(() => {
    localStorage.setItem('pedidoFornecedor', fornecedor);
  }, [fornecedor]);

  useEffect(() => {
    localStorage.setItem('pedidoAtivoId', pedidoAtivoId || '');
  }, [pedidoAtivoId]);

  useEffect(() => {
    localStorage.setItem('pedidoIsSaved', isSaved);
  }, [isSaved]);

  useEffect(() => {
    localStorage.setItem('pedidoIsSaved', isSaved);
  }, [isSaved]);
  
  // Item Avulso
  const [avulsoNome, setAvulsoNome] = useState('');
  const [avulsoQtd, setAvulsoQtd] = useState(1);

  const addToPedido = (peca) => {
    if (isSaved) return;
    if (!pedido.find(p => p.id === peca.id)) {
      setPedido([...pedido, { ...peca, qtdPedida: 5 }]); // default 5 units
    }
  };

  const removeFromPedido = (id) => {
    if (isSaved) return;
    setPedido(pedido.filter(p => p.id !== id));
  };

  const updateQtd = (id, qtd) => {
    if (isSaved) return;
    const parsed = parseInt(qtd);
    if (isNaN(parsed) || parsed < 1) return;
    setPedido(pedido.map(p => p.id === id ? { ...p, qtdPedida: parsed } : p));
  };

  const addAllEsgotados = () => {
    if (isSaved) return;
    const esgotados = catalogoFiltrado.filter(e => e.qtd === 0);
    const novos = esgotados.filter(e => !pedido.find(p => p.id === e.id)).map(e => ({ ...e, qtdPedida: 5 }));
    setPedido([...pedido, ...novos]);
  };

  const handleAddAvulso = (e) => {
    e.preventDefault();
    if (isSaved || !avulsoNome.trim()) return;
    
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

  // Ações do Pedido
  const salvarEContinuar = async () => {
    if (pedido.length === 0) return;
    
    let idParaSalvar = pedidoAtivoId;
    if (!idParaSalvar) {
      idParaSalvar = `PED-${Date.now().toString().slice(-6)}`;
      setPedidoAtivoId(idParaSalvar);
    }

    const novoPedidoObj = {
      id: idParaSalvar,
      data: new Date().toISOString(),
      fornecedor,
      itens: pedido
    };

    await salvarPedido(novoPedidoObj);
    setIsSaved(true);
  };

  const editarPedido = () => {
    setIsSaved(false);
  };

  const excluirPedidoAtual = async () => {
    if (!pedidoAtivoId) {
       novoPedido();
       return;
    }
    if (window.confirm("Deseja realmente excluir este pedido salvo?")) {
      await deletarPedido(pedidoAtivoId);
      novoPedido();
    }
  };

  const novoPedido = () => {
    setPedidoAtivoId(null);
    setIsSaved(false);
    setPedido([]);
    setFornecedor('');
  };

  const carregarPedido = (ped) => {
    setPedidoAtivoId(ped.id);
    setFornecedor(ped.fornecedor || '');
    setPedido(ped.itens || []);
    setIsSaved(true);
    setShowHistorico(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '2rem' }}>
      
      {/* Modal de Histórico */}
      {showHistorico && (
        <div className="no-print" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div className="card" style={{width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold'}}>Histórico de Pedidos</h2>
              <button onClick={() => setShowHistorico(false)} className="btn btn-outline" style={{padding: '0.5rem'}}><X size={20} /></button>
            </div>
            {pedidosHistorico.length === 0 ? (
              <p style={{color: 'var(--color-text-muted)'}}>Nenhum pedido salvo.</p>
            ) : (
              <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
                {pedidosHistorico.map(ped => (
                  <div key={ped.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface-hover)'}}>
                     <div>
                       <div style={{fontWeight: 'bold'}}>ID: {ped.id}</div>
                       <div style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>{new Date(ped.data).toLocaleString('pt-BR')} | Fornecedor: {ped.fornecedor || 'Nenhum'}</div>
                       <div style={{fontSize: '0.875rem', color: 'var(--color-text-muted)'}}>Itens: {ped.itens?.length || 0}</div>
                     </div>
                     <button className="btn btn-primary" onClick={() => carregarPedido(ped)}>Abrir</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cabeçalho */}
      <header className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={28} /> Reposição e Pedidos
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Gere orçamentos e pedidos de compra para suas peças esgotadas.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setShowHistorico(true)}>
            <History size={20} /> Pedidos Salvos
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
            <strong>ID do Pedido:</strong> {pedidoAtivoId || 'Rascunho'}<br/>
            <strong>Total de Peças:</strong> {pedido.reduce((acc, p) => acc + p.qtdPedida, 0)} un.
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="no-print" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--color-border)' }}>
        <button 
          onClick={() => setActiveTab('compras')}
          style={{ 
            padding: '0.5rem 1rem', 
            background: 'none', 
            border: 'none',
            borderBottom: activeTab === 'compras' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'compras' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'compras' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          Pedidos de Compra (Estoque)
        </button>
        <button 
          onClick={() => setActiveTab('orcamentos')}
          style={{ 
            padding: '0.5rem 1rem', 
            background: 'none', 
            border: 'none',
            borderBottom: activeTab === 'orcamentos' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'orcamentos' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'orcamentos' ? 'bold' : 'normal',
            cursor: 'pointer'
          }}
        >
          Orçamentos de Clientes
        </button>
      </div>

      {activeTab === 'compras' ? (
        <div className="grid md:grid-cols-2 gap-6">
        
        {/* Lado Esquerdo: Peças Esgotadas (Oculto na impressão) */}
        <div className="card no-print" style={{ display: 'flex', flexDirection: 'column', opacity: isSaved ? 0.5 : 1, pointerEvents: isSaved ? 'none' : 'auto', minWidth: 0 }}>
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
                      <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', wordBreak: 'break-word', flexWrap: 'wrap' }}>
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
        <div className="card print-expand" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <h2 className="no-print" style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={20} color="var(--color-primary)" /> 
              {pedidoAtivoId ? `Pedido ${pedidoAtivoId}` : 'Novo Pedido'}
            </span>
            {isSaved && <span style={{fontSize: '0.75rem', backgroundColor: 'var(--color-success)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px'}}>SALVO</span>}
          </h2>

          <div className="no-print" style={{ marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              placeholder="Nome do Fornecedor ou Observação (Opcional)" 
              value={fornecedor}
              onChange={e => setFornecedor(e.target.value)}
              disabled={isSaved}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: isSaved ? 'var(--color-surface-hover)' : 'var(--color-surface)' }}
            />
          </div>

          {/* Adicionar Item Avulso */}
          {!isSaved && (
            <form className="no-print" onSubmit={handleAddAvulso} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="Digitar item não cadastrado..." 
                value={avulsoNome}
                onChange={e => setAvulsoNome(e.target.value)}
                style={{ flex: '1 1 200px', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
              <input 
                type="number" 
                min="1"
                value={avulsoQtd}
                onChange={e => setAvulsoQtd(e.target.value)}
                style={{ width: '80px', flex: '0 0 80px', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              />
              <button type="submit" className="btn btn-outline" style={{ padding: '0.5rem', flex: '0 0 auto' }}>
                <Plus size={20} />
              </button>
            </form>
          )}

          {pedido.length === 0 ? (
            <div className="no-print" style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--color-text-muted)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <p>Selecione as peças esgotadas ao lado para montar seu pedido de compra.</p>
            </div>
          ) : (
            <>
              <div className="table-responsive" style={{ overflowX: 'auto', marginBottom: '1rem' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: 'var(--color-surface-hover)' }}>
                    <tr>
                      <th style={{ padding: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Peça / Descrição</th>
                      <th style={{ padding: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Cód. Original</th>
                      <th style={{ padding: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', width: '120px' }}>Qtd</th>
                      {!isSaved && <th className="no-print" style={{ padding: '0.75rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', width: '60px' }}></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {pedido.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ fontWeight: 600, wordBreak: 'break-word' }}>{item.nome}</div>
                          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', wordBreak: 'break-all' }}>ID: {item.id}</div>
                        </td>
                        <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.875rem' }}>{item.oem}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="print-only" style={{ fontWeight: 'bold' }}>{item.qtdPedida} un</span>
                          {isSaved ? (
                            <span className="no-print" style={{ fontWeight: 'bold' }}>{item.qtdPedida} un</span>
                          ) : (
                            <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              <button type="button" onClick={() => updateQtd(item.id, item.qtdPedida - 1)} className="btn btn-outline" style={{ padding: '0.2rem 0.4rem', minWidth: '30px' }}><Minus size={14} /></button>
                              <input 
                                type="number" 
                                min="1"
                                value={item.qtdPedida}
                                onChange={(e) => updateQtd(item.id, e.target.value)}
                                style={{ width: '50px', padding: '0.25rem', textAlign: 'center', border: '1px solid var(--color-border)', borderRadius: '4px' }}
                              />
                              <button type="button" onClick={() => updateQtd(item.id, item.qtdPedida + 1)} className="btn btn-outline" style={{ padding: '0.2rem 0.4rem', minWidth: '30px' }}><Plus size={14} /></button>
                            </div>
                          )}
                        </td>
                        {!isSaved && (
                          <td className="no-print" style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button 
                              style={{ color: 'var(--color-danger)', padding: '0.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}
                              onClick={() => removeFromPedido(item.id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Botões de Ação Final */}
              <div className="no-print" style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {!isSaved ? (
                  <button className="btn btn-primary" onClick={salvarEContinuar} style={{ width: '100%' }}>
                    <Save size={18} /> Salvar Pedido e Continuar
                  </button>
                ) : (
                  <>
                    <button className="btn btn-outline" onClick={novoPedido} style={{ flex: 1, minWidth: '100px', display: 'flex', justifyContent: 'center' }}>
                      Novo
                    </button>
                    <button className="btn btn-outline" onClick={editarPedido} style={{ flex: 1, minWidth: '100px', display: 'flex', justifyContent: 'center' }}>
                      <Edit size={18} /> Editar
                    </button>
                    <button className="btn btn-primary" onClick={handlePrint} style={{ flex: 1, minWidth: '140px', display: 'flex', justifyContent: 'center' }}>
                      <Printer size={18} /> Imprimir / PDF
                    </button>
                    <button className="btn" onClick={excluirPedidoAtual} style={{ flex: 1, minWidth: '100px', backgroundColor: 'var(--color-danger)', color: 'white', border: 'none', display: 'flex', justifyContent: 'center' }}>
                      <Trash2 size={18} /> Excluir
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>

      </div>
      ) : (
        <OrcamentosView />
      )}
    </div>
  );
}

