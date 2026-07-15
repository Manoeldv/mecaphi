import React, { useState, useEffect } from 'react';
import { Search, Filter, Image as ImageIcon, MapPin, Edit2, Trash2, ShoppingCart, Camera, BrainCircuit, ScanLine, Eye, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import CameraCapture from '../components/ui/CameraCapture';
import NovaPecaModal from '../components/features/NovaPecaModal';

export default function Estoque() {
  const { estoque, updatePeca, deletePeca, showToast, finalizarVenda } = useAppContext();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [aiResults, setAiResults] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [itemToSell, setItemToSell] = useState(null);
  const [itemToView, setItemToView] = useState(null);
  const [sellQuantity, setSellQuantity] = useState(1);
  const [sellMethod, setSellMethod] = useState('Dinheiro');
  const [isNovaPecaModalOpen, setIsNovaPecaModalOpen] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVeiculo, setFilterVeiculo] = useState('Todos');
  const [filterCondicao, setFilterCondicao] = useState('Todas');
  const [filterLocal, setFilterLocal] = useState('Todos');
  const [sortBy, setSortBy] = useState('Mais Recentes');

  // AI Visual Search States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isEditCameraOpen, setIsEditCameraOpen] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState(0);

  // Listas únicas para os Selects
  const uniqueVeiculos = ['Todos', ...new Set(estoque.map(i => i.veiculoId).filter(v => v && v !== '-'))];
  const uniqueCondicoes = ['Todas', ...new Set(estoque.map(i => i.condicao).filter(Boolean))];
  const uniqueLocais = ['Todos', ...new Set(estoque.map(i => i.local).filter(Boolean))];

  // Aplicação dos Filtros
  // Se a IA encontrou resultados, usamos eles como base. Caso contrário, usamos o estoque completo.
  const baseEstoque = aiResults || estoque;
  
  let filteredEstoque = baseEstoque.filter(item => {
    // Se temos resultados da IA e o searchTerm está vazio, apenas mostra os resultados da IA.
    const matchesSearch = aiResults && searchTerm === '' 
      ? true 
      : item.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (item.oem && item.oem.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesVeiculo = filterVeiculo === 'Todos' || item.veiculoId === filterVeiculo;
    const matchesCondicao = filterCondicao === 'Todas' || item.condicao === filterCondicao;
    const matchesLocal = filterLocal === 'Todos' || item.local === filterLocal;

    return matchesSearch && matchesVeiculo && matchesCondicao && matchesLocal;
  });

  if (sortBy === 'Menor Quantidade') {
    filteredEstoque = [...filteredEstoque].sort((a, b) => a.qtd - b.qtd);
  } else if (sortBy === 'Maior Quantidade') {
    filteredEstoque = [...filteredEstoque].sort((a, b) => b.qtd - a.qtd);
  } else if (sortBy === 'Mais Recentes') {
    // Garante que os recém-cadastrados fiquem SEMPRE no topo, comparando datas
    filteredEstoque = [...filteredEstoque].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  // Quick mock for responsive resize detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // AI Real Integration Logic
  const handleCaptureAI = async (photoUrl) => {
    setIsAIProcessing(true);
    setAiAnalysisStep(1); // Mudei para iniciar o progresso visual

    try {
      // Simulate progress visually while fetching
      const interval = setInterval(() => {
        setAiAnalysisStep(s => (s < 2 ? s + 1 : s));
      }, 1000);

      const res = await fetch('/api/search/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: photoUrl })
      });

      clearInterval(interval);
      setAiAnalysisStep(3); // Completo

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setIsAIProcessing(false);
          setAiAnalysisStep(0);
          if (data.results && data.results.length > 0) {
            // Exibe DIRETAMENTE os resultados encontrados pelo banco de dados da IA!
            setAiResults(data.results);
            setSearchTerm(''); // Limpa o texto para não interferir na listagem direta
            showToast(`IA identificou: "${data.suggestion}". Encontramos ${data.results.length} peça(s)!`);
          } else {
            setAiResults(null);
            setSearchTerm(''); // Limpa a busca para a peça não sumir da tela
            showToast(`"${data.suggestion}" não encontrado no estoque local. Buscando na internet...`, 'error');
            setTimeout(() => {
              window.open(`https://lista.mercadolivre.com.br/${encodeURIComponent(data.suggestion)}`, '_blank');
            }, 1500);
          }
        }, 1000);
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Erro desconhecido');
      }
    } catch (error) {
      setTimeout(() => {
        setIsAIProcessing(false);
        setAiAnalysisStep(0);
        showToast(`Erro na IA: ${error.message}`, 'error');
      }, 1000);
    }
  };

  const confirmDelete = () => {
    deletePeca(itemToDelete);
    setItemToDelete(null);
    showToast('Peça excluída do estoque.');
  };

  const handleQuickSell = (e) => {
    e.preventDefault();
    if (sellQuantity > itemToSell.qtd) {
      showToast('Quantidade maior do que o disponível em estoque.', 'error');
      return;
    }
    if (sellQuantity <= 0) return;

    // Simulate a cart array for the context function
    const pseudoCart = [{
      ...itemToSell,
      preco: itemToSell.preco || (Math.random() * 500 + 50), // Mock price if not exists
      qtd: sellQuantity
    }];

    finalizarVenda(pseudoCart, { metodoPagamento: sellMethod });
    setItemToSell(null);
    setSellQuantity(1);
    setSellMethod('Dinheiro');
  };

  const handleEdit = (item) => {
    setEditingItem({ ...item });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    updatePeca(editingItem);
    setEditingItem(null);
    showToast('Peça atualizada com sucesso!');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Estoque e Busca</h1>
      </header>

      {/* Advanced Filters */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={20} />
            <input 
              type="text" 
              placeholder="Buscar por Nome, SKU ou OEM..." 
              style={{ paddingLeft: '3rem', fontSize: '1rem' }} 
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                // Sempre descarta os resultados da IA se o usuário modificar a barra de busca
                setAiResults(null);
              }}
            />
          </div>
          <button className="btn btn-accent" onClick={() => setIsCameraOpen(true)} title="Busca Visual com Inteligência Artificial">
            <Camera size={20} /> <span className="hidden-mobile">Busca Visual (IA)</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsNovaPecaModalOpen(true)} title="Cadastrar Nova Peça">
            <Plus size={20} /> <span className="hidden-mobile">Nova Peça</span>
          </button>
          <button className="btn btn-outline" title="Filtros Avançados">
            <Filter size={20} /> <span className="hidden-mobile">Filtros</span>
          </button>
        </div>
        
        {/* Expanded Filters */}
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>Veículo</label>
            <select value={filterVeiculo} onChange={(e) => setFilterVeiculo(e.target.value)}>
              {uniqueVeiculos.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>Condição</label>
            <select value={filterCondicao} onChange={(e) => setFilterCondicao(e.target.value)}>
              {uniqueCondicoes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>Localização</label>
            <select value={filterLocal} onChange={(e) => setFilterLocal(e.target.value)}>
              {uniqueLocais.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>Ordenar por</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option>Mais Recentes</option>
              <option>Menor Quantidade</option>
              <option>Maior Quantidade</option>
            </select>
          </div>
        </div>
      </div>

      {/* List / Grid */}
      {isMobile ? (
        // Mobile Cards
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredEstoque.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Nenhuma peça encontrada com esses filtros.</div>
          ) : filteredEstoque.map(item => (
            <div key={item.id} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {item.foto ? (
                    <img src={item.foto} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <ImageIcon size={24} color="var(--color-text-muted)" />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.nome}</h3>
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>SKU: {item.id} • OEM: {item.oem}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-success">{item.condicao}</span>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Qtd: {item.qtd}</span>
                  </div>
                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: item.color, backgroundColor: `${item.color}15`, padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, width: 'fit-content' }}>
                    <MapPin size={14} /> Local: {item.local}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-border)', paddingTop: '1rem' }}>
                <button onClick={() => { setItemToSell(item); setSellQuantity(1); }} className="btn" style={{ flex: 1, color: 'var(--color-success)', backgroundColor: 'rgba(34, 197, 94, 0.1)' }} title="Vender" disabled={item.qtd === 0}><ShoppingCart size={18} opacity={item.qtd === 0 ? 0.3 : 1} /> Vender</button>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '0.5rem' }}>
                  <button onClick={() => setItemToView(item)} className="btn" style={{ color: 'var(--color-text)', backgroundColor: 'var(--color-surface-hover)', padding: '0.5rem' }} title="Detalhes"><Eye size={18} /></button>
                  <button onClick={() => handleEdit(item)} className="btn" style={{ color: 'var(--color-primary)', backgroundColor: 'rgba(30, 58, 138, 0.1)', padding: '0.5rem' }} title="Editar"><Edit2 size={18} /></button>
                  <button onClick={() => setItemToDelete(item.id)} className="btn" style={{ color: 'var(--color-danger)', backgroundColor: 'rgba(220, 38, 38, 0.1)', padding: '0.5rem' }} title="Excluir"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Desktop Table
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--color-surface-hover)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Foto</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Informações da Peça</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>OEM</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Qtd / Condição</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Localização Exata</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredEstoque.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Nenhuma peça encontrada com esses filtros.</td></tr>
              ) : filteredEstoque.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      {item.foto ? (
                        <img src={item.foto} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <ImageIcon size={20} color="var(--color-text-muted)" />
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <h3 style={{ fontWeight: 600 }}>{item.nome}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>SKU: {item.id}</p>
                  </td>
                  <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>{item.oem}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{item.qtd} un.</div>
                    <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>{item.condicao}</span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ 
                      display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
                      color: item.color, backgroundColor: `${item.color}15`, 
                      padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', 
                      fontWeight: 600 
                    }}>
                      <MapPin size={16} /> {item.local}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => { setItemToSell(item); setSellQuantity(1); }} disabled={item.qtd === 0} style={{ padding: '0.5rem', color: item.qtd > 0 ? 'var(--color-success)' : 'var(--color-text-muted)', backgroundColor: item.qtd > 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-md)', cursor: item.qtd > 0 ? 'pointer' : 'not-allowed' }} title="Vender">
                        <ShoppingCart size={16} />
                      </button>
                      <button onClick={() => setItemToView(item)} style={{ padding: '0.5rem', color: 'var(--color-text)', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }} title="Ver Detalhes">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleEdit(item)} style={{ padding: '0.5rem', color: 'var(--color-primary)', backgroundColor: 'rgba(30, 58, 138, 0.1)', borderRadius: 'var(--radius-md)' }} title="Editar">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => setItemToDelete(item.id)} style={{ padding: '0.5rem', color: 'var(--color-danger)', backgroundColor: 'rgba(220, 38, 38, 0.1)', borderRadius: 'var(--radius-md)' }} title="Excluir">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Little global CSS hack for the hidden-mobile class above */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 767px) {
          .hidden-mobile { display: none; }
        }
      `}} />

      {/* Custom Confirmation Modal */}
      <Modal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} title="Confirmar Exclusão" maxWidth="400px">
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)' }}>Tem certeza que deseja remover esta peça permanentemente do estoque? Esta ação não pode ser desfeita.</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className="btn btn-outline" onClick={() => setItemToDelete(null)}>Cancelar</button>
          <button className="btn" style={{ backgroundColor: 'var(--color-danger)', color: 'white' }} onClick={confirmDelete}>Excluir Peça</button>
        </div>
      </Modal>

      {/* Venda Rápida Modal */}
      <Modal isOpen={!!itemToSell} onClose={() => setItemToSell(null)} title="Venda Rápida" maxWidth="400px">
        {itemToSell && (
          <form onSubmit={handleQuickSell} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>{itemToSell.nome}</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Estoque Disponível: <strong>{itemToSell.qtd}</strong></p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Quantidade para Venda</label>
              <input 
                type="number" 
                min="1" 
                max={itemToSell.qtd} 
                value={sellQuantity} 
                onChange={e => setSellQuantity(parseInt(e.target.value) || 1)} 
                required
                style={{ fontSize: '1.25rem', padding: '0.75rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Forma de Pagamento</label>
              <select 
                value={sellMethod} 
                onChange={e => setSellMethod(e.target.value)}
                style={{ padding: '0.75rem' }}
              >
                <option>Dinheiro</option>
                <option>PIX</option>
                <option>Cartão de Crédito</option>
                <option>Cartão de Débito</option>
              </select>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setItemToSell(null)}>Cancelar</button>
              <button type="submit" className="btn btn-success" style={{ backgroundColor: 'var(--color-success)', color: 'white' }}>
                <ShoppingCart size={18} /> Confirmar Venda
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Ver Detalhes Modal */}
      <Modal isOpen={!!itemToView} onClose={() => setItemToView(null)} title="Detalhes da Peça" maxWidth="500px">
        {itemToView && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ width: '100%', minHeight: '200px', maxHeight: '350px', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {itemToView.foto ? (
                <img src={itemToView.foto} alt={itemToView.nome} style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }} />
              ) : (
                <ImageIcon size={48} color="var(--color-text-muted)" />
              )}
            </div>

            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{itemToView.nome}</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>ID: {itemToView.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>PREÇO</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 'bold', color: 'var(--color-success)' }}>R$ {itemToView.preco?.toFixed(2) || '0.00'}</span>
              </div>
              <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>ESTOQUE</span>
                <span style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>{itemToView.qtd} un.</span>
              </div>
            </div>

            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>OEM:</span>
                <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{itemToView.oem || '-'}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Categoria:</span>
                <span style={{ fontWeight: 500 }}>{itemToView.categoria || '-'}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Condição:</span>
                <span className="badge badge-success">{itemToView.condicao}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Localização Física:</span>
                <span style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14}/> {itemToView.local}</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: '0.5rem' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>ID Veículo Doador:</span>
                <span style={{ fontWeight: 600 }}>{itemToView.veiculoId || 'Avulso'}</span>
              </li>
            </ul>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <button className="btn btn-outline" onClick={() => setItemToView(null)}>Fechar</button>
              <button className="btn btn-primary" onClick={() => { handleEdit(itemToView); setItemToView(null); }}>
                <Edit2 size={18} /> Editar Peça
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Edição */}
      {editingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--color-surface)', position: 'relative' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Editar Peça - {editingItem.id}</h2>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Nome da Peça</label>
                <input type="text" value={editingItem.nome} onChange={e => setEditingItem({...editingItem, nome: e.target.value})} required />
              </div>
              
              {/* Edição de Foto */}
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Foto da Peça</label>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', backgroundColor: 'var(--color-surface-hover)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                  {editingItem.foto ? (
                    <div style={{ position: 'relative', width: '64px', height: '64px' }}>
                      <img src={editingItem.foto} alt="Peça" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                      <button type="button" onClick={() => setEditingItem({...editingItem, foto: null})} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--color-danger)', color: 'white', borderRadius: '50%', padding: '0.25rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Apagar Foto">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ImageIcon size={24} color="var(--color-text-muted)" />
                    </div>
                  )}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Para trocar, escolha uma nova imagem:</span>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setEditingItem({...editingItem, foto: reader.result});
                            reader.readAsDataURL(file);
                          }
                        }} 
                        style={{ fontSize: '0.875rem', flex: 1, padding: '0' }}
                      />
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', flexShrink: 0 }}
                        onClick={() => setIsEditCameraOpen(true)}
                        title="Tirar Foto"
                      >
                        <Camera size={14} /> Câmera
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>OEM</label>
                  <input type="text" value={editingItem.oem} onChange={e => setEditingItem({...editingItem, oem: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Quantidade</label>
                  <input type="number" value={editingItem.qtd} onChange={e => setEditingItem({...editingItem, qtd: parseInt(e.target.value)})} required min="0" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Condição</label>
                  <select value={editingItem.condicao} onChange={e => setEditingItem({...editingItem, condicao: e.target.value})}>
                    <option>Nova</option>
                    <option>Usada (Bom Estado)</option>
                    <option>Usada</option>
                    <option>Recuperada</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Localização</label>
                  <input type="text" value={editingItem.local} onChange={e => setEditingItem({...editingItem, local: e.target.value})} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setEditingItem(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Busca Visual Câmera */}
      <CameraCapture 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={handleCaptureAI}
      />

      {/* Modal de Processamento IA */}
      <Modal isOpen={isAIProcessing} onClose={() => {}} title="Análise IA em Andamento" maxWidth="400px">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '2rem 0' }}>
          <BrainCircuit size={48} color="var(--color-accent)" style={{ animation: 'spin 3s linear infinite' }} />
          
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>Buscando Correspondências</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              {aiAnalysisStep === 0 && 'Extraindo geometria e pontos chave da imagem...'}
              {aiAnalysisStep === 1 && 'Identificando textura e materialidade...'}
              {aiAnalysisStep === 2 && 'Cruzando dados com o banco de peças...'}
              {aiAnalysisStep >= 3 && 'Resultados encontrados!'}
            </p>
          </div>

          <div style={{ width: '100%', backgroundColor: 'var(--color-surface-hover)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ 
              height: '100%', 
              backgroundColor: 'var(--color-accent)', 
              width: `${(aiAnalysisStep / 3) * 100}%`,
              transition: 'width 0.8s ease'
            }} />
          </div>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin { 100% { transform: rotate(360deg); } }
        `}} />
      </Modal>

      {/* Nova Peça Modal Integrado */}
      <NovaPecaModal 
        isOpen={isNovaPecaModalOpen} 
        onClose={() => setIsNovaPecaModalOpen(false)} 
      />

      {/* Busca Visual Câmera para Edição */}
      {editingItem && (
        <CameraCapture 
          isOpen={isEditCameraOpen} 
          onClose={() => setIsEditCameraOpen(false)} 
          onCapture={(photoData) => setEditingItem({...editingItem, foto: photoData})}
        />
      )}

    </div>
  );
}
