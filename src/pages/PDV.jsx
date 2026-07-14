import React, { useState, useRef, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Trash2, CreditCard, Keyboard, Camera, BrainCircuit } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Modal from '../components/ui/Modal';
import CameraCapture from '../components/ui/CameraCapture';

export default function PDV() {
  const { estoque, finalizarVenda, showToast } = useAppContext();
  const [cart, setCart] = useState([]);
  const [busca, setBusca] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ metodo: 'Dinheiro', cliente: '' });
  
  // AI Visual Search States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [aiAnalysisStep, setAiAnalysisStep] = useState(0);
  const [aiResults, setAiResults] = useState(null);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const searchInputRef = useRef(null);

  // Focus input automatically on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Create a searchable catalog from actual estoque.
  const catalogo = estoque.filter(p => p.qtd > 0).map(p => ({
    ...p,
    preco: p.preco || 0 // Use real price or 0 if not set
  }));

  const handleAddToCart = (item) => {
    const exists = cart.find(i => i.id === item.id);
    if (exists) {
      setCart(cart.map(i => i.id === item.id ? { ...i, qtd: i.qtd + 1 } : i));
    } else {
      setCart([...cart, { ...item, qtd: 1 }]);
    }
    setBusca(''); // Clear search
    // Manter o foco na busca após adicionar um item novo (facilita bipar vários itens rápidos)
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const handleUpdateCart = (id, field, value) => {
    setCart(cart.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const handleCaptureAI = async (photoUrl) => {
    setIsAIProcessing(true);
    setAiAnalysisStep(1);

    try {
      const interval = setInterval(() => {
        setAiAnalysisStep(s => (s < 2 ? s + 1 : s));
      }, 1000);

      const res = await fetch('/api/search/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: photoUrl })
      });

      clearInterval(interval);
      setAiAnalysisStep(3);

      if (res.ok) {
        const data = await res.json();
        setTimeout(() => {
          setIsAIProcessing(false);
          setAiAnalysisStep(0);
          if (data.results && data.results.length > 0) {
            // Exibe DIRETAMENTE os resultados encontrados pelo banco de dados da IA!
            setAiResults(data.results);
            setBusca(''); // Limpa a busca para não conflitar com a listagem direta
            showToast(`IA identificou: "${data.suggestion}". Encontramos ${data.results.length} peça(s)!`);
          } else {
            setAiResults(null);
            setBusca(''); // Limpa a busca para as peças não sumirem da tela
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

  const handleFinalizar = () => {
    if (cart.length === 0) return;

    // Verificar se as quantidades não excedem o estoque
    for (const item of cart) {
      const stockItem = estoque.find(p => p.id === item.id);
      if (!stockItem || item.qtd > stockItem.qtd) {
        showToast(`Erro: A quantidade de "${item.nome}" excede o estoque disponível (${stockItem ? stockItem.qtd : 0}).`, 'error');
        return; // Stop the sale
      }
    }

    // Ao invés de finalizar direto, abre o modal de checkout
    setIsCheckoutOpen(true);
  };

  const confirmCheckout = (e) => {
    e.preventDefault();
    finalizarVenda(cart, { metodoPagamento: checkoutData.metodo, cliente: checkoutData.cliente });
    setCart([]);
    setIsCheckoutOpen(false);
    setCheckoutData({ metodo: 'Dinheiro', cliente: '' });
  };

  const filtradas = aiResults ? aiResults : catalogo.filter(item => 
    item.nome.toLowerCase().includes(busca.toLowerCase()) || 
    item.id.toLowerCase().includes(busca.toLowerCase())
  );

  const total = cart.reduce((acc, item) => acc + ((parseFloat(item.preco) || 0) * (parseInt(item.qtd) || 0)), 0);

  return (
    <div style={{ height: isMobile ? 'auto' : 'calc(100vh - 3rem)', minHeight: 'calc(100vh - 3rem)', display: 'flex', flexDirection: 'column', paddingBottom: isMobile ? '6rem' : '0' }}>
      <header style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Frente de Caixa (PDV)</h1>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Keyboard size={14} /> [F2] Nova Venda</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Keyboard size={14} /> [F4] Pagamento</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Operador: João Silva</span>
          <br/>
          <span className="badge badge-success" style={{ marginTop: '0.25rem' }}>Caixa Aberto</span>
        </div>
      </header>

      <div style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem', overflow: isMobile ? 'visible' : 'hidden' }}>
        
        {/* Esquerda: Busca e Resultados */}
        <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: isMobile ? 'visible' : 'hidden' }}>
          <div style={{ position: 'relative', display: 'flex', gap: '0.5rem' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} size={24} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="Buscar peça por código de barras ou nome..." 
                style={{ paddingLeft: '3.5rem', fontSize: '1.25rem', padding: '1rem 1rem 1rem 3.5rem', width: '100%' }}
                value={busca}
                onChange={(e) => {
                  setBusca(e.target.value);
                  setAiResults(null);
                }}
              />
            </div>
            <button className="btn btn-accent" style={{ padding: '0 1rem' }} onClick={() => setIsCameraOpen(true)} title="Busca Visual com Inteligência Artificial">
              <Camera size={24} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {busca.length > 1 || aiResults ? (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filtradas.map(item => (
                  <li key={item.id} style={{ 
                    display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', 
                    padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', gap: isMobile ? '1rem' : '0'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface-hover)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {item.foto ? <img src={item.foto} alt={item.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Search size={20} color="var(--color-text-muted)" />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontWeight: 600, fontSize: isMobile ? '1rem' : '1.125rem' }}>{item.nome}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>{item.id} • {item.condicao} • Estoque: {item.qtd}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: isMobile ? 'space-between' : 'flex-end', borderTop: isMobile ? '1px solid var(--color-border)' : 'none', paddingTop: isMobile ? '0.5rem' : '0' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.125rem' }}>R$ {item.preco.toFixed(2)}</span>
                      <button className="btn btn-outline" onClick={() => handleAddToCart(item)}>
                        <Plus size={18} /> Add
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-muted)' }}>
                <Search size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                <p>Bipe a peça ou digite para buscar.</p>
              </div>
            )}
          </div>
        </div>

        {/* Direita: Carrinho */}
        <div className="card" style={{ width: isMobile ? '100%' : '400px', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderLeft: isMobile ? 'none' : '4px solid var(--color-primary)', borderTop: isMobile ? '4px solid var(--color-primary)' : 'none' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--color-border)' }}>
            <ShoppingCart size={24} color="var(--color-primary)" /> Carrinho
          </h2>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1.5rem' }}>
            {cart.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginTop: '2rem' }}>Carrinho vazio</p>
            ) : (
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {cart.map(item => (
                  <li key={item.id} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid var(--color-border)', gap: isMobile ? '0.5rem' : '0' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>{item.nome}</h4>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <input 
                          type="number" 
                          min="1" 
                          value={item.qtd} 
                          onChange={(e) => handleUpdateCart(item.id, 'qtd', e.target.value)}
                          style={{ width: '60px', padding: '0.25rem', fontSize: '0.75rem' }}
                          title="Quantidade"
                        />
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>x</span>
                        <div style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
                          <span style={{ position: 'absolute', left: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>R$</span>
                          <input 
                            type="number" 
                            min="0"
                            step="0.01"
                            value={item.preco} 
                            onChange={(e) => handleUpdateCart(item.id, 'preco', e.target.value)}
                            style={{ width: '90px', padding: '0.25rem 0.25rem 0.25rem 1.75rem', fontSize: '0.75rem' }}
                            title="Preço Unitário"
                          />
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', alignItems: isMobile ? 'center' : 'flex-end', justifyContent: isMobile ? 'space-between' : 'flex-start', gap: '0.5rem', marginTop: isMobile ? '0.5rem' : '0' }}>
                      <span style={{ fontWeight: 600 }}>R$ {((parseFloat(item.preco) || 0) * (parseInt(item.qtd) || 0)).toFixed(2)}</span>
                      <button className="btn" style={{ padding: '0.25rem', color: 'var(--color-danger)' }} onClick={() => setCart(cart.filter(i => i.id !== item.id))}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ borderTop: '2px dashed var(--color-border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1.125rem', color: 'var(--color-text-muted)' }}>Total:</span>
              <span style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--color-primary)' }}>R$ {total.toFixed(2)}</span>
            </div>
            <button className="btn btn-accent" style={{ padding: '1rem', fontSize: '1.25rem', display: 'flex', justifyContent: 'center' }} disabled={cart.length === 0} onClick={handleFinalizar}>
              <CreditCard size={24} /> Finalizar Venda [F4]
            </button>
          </div>
        </div>

      </div>

      {/* Checkout Modal */}
      <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Pagamento e Finalização" maxWidth="500px">
        <form onSubmit={confirmCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ backgroundColor: 'var(--color-surface-hover)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Valor Total a Pagar</span>
            <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)' }}>R$ {total.toFixed(2)}</span>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Forma de Pagamento</label>
            <select 
              value={checkoutData.metodo} 
              onChange={e => setCheckoutData({...checkoutData, metodo: e.target.value})}
              style={{ fontSize: '1.125rem', padding: '0.75rem' }}
            >
              <option>Dinheiro</option>
              <option>PIX</option>
              <option>Cartão de Crédito</option>
              <option>Cartão de Débito</option>
              <option>Transferência Bancária</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Nome do Cliente / Observação (Opcional)</label>
            <input 
              type="text" 
              placeholder="Ex: João da Oficina" 
              value={checkoutData.cliente} 
              onChange={e => setCheckoutData({...checkoutData, cliente: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" style={{ width: isMobile ? '100%' : 'auto' }} onClick={() => setIsCheckoutOpen(false)}>Voltar ao Carrinho</button>
            <button type="submit" className="btn btn-success" style={{ backgroundColor: 'var(--color-success)', color: 'white', width: isMobile ? '100%' : 'auto' }}>
              <CreditCard size={18} /> Confirmar Pagamento
            </button>
          </div>
        </form>
      </Modal>

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

    </div>
  );
}
