import React, { useState, useEffect } from 'react';
import { FileText, Copy, Plus, Trash2, ExternalLink, MessageCircle, Edit, Save, X, Printer } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function OrcamentosView() {
  const { orcamentos, salvarOrcamento, atualizarOrcamento, deletarOrcamento, showToast } = useAppContext();
  const [selectedOrcamento, setSelectedOrcamento] = useState(null);
  
  const [editMode, setEditMode] = useState(false);
  const [editedOrcamento, setEditedOrcamento] = useState(null);
  const [novoItemNome, setNovoItemNome] = useState('');
  const [novoItemQtd, setNovoItemQtd] = useState(1);
  const [novoItemPreco, setNovoItemPreco] = useState('');

  // Keep selectedOrcamento in sync with updates from websocket
  useEffect(() => {
    if (selectedOrcamento && !editMode) {
      const updated = orcamentos.find(o => o.id === selectedOrcamento.id);
      if (updated) setSelectedOrcamento(updated);
    }
  }, [orcamentos, selectedOrcamento, editMode]);

  const handleNovoOrcamento = async () => {
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const novo = await salvarOrcamento({
      token,
      cliente: '',
      telefone: '',
      veiculo: '',
      itens: [],
      observacoes: ''
    });
    if (novo) {
      setSelectedOrcamento(novo);
      setEditMode(true);
      setEditedOrcamento(novo);
    }
  };

  const copiarLink = (token) => {
    const link = `${window.location.origin}/orcamento/${token}`;
    navigator.clipboard.writeText(link);
    showToast('Link copiado! Envie para o cliente.', 'success');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pendente': return 'var(--color-warning)';
      case 'Respondido': return 'var(--color-primary)';
      case 'Aprovado': return 'var(--color-success)';
      case 'Rejeitado': return 'var(--color-danger)';
      case 'Finalizado': return 'var(--color-text-muted)';
      default: return 'var(--color-text-muted)';
    }
  };

  const handleEditClick = () => {
    setEditedOrcamento({ ...selectedOrcamento });
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    // Tratar os preços dos itens para garantir que sejam Number válidos (trocar vírgula por ponto)
    const orcamentoTratado = {
      ...editedOrcamento,
      itens: editedOrcamento.itens.map(item => ({
        ...item,
        preco: typeof item.preco === 'string' ? parseFloat(item.preco.replace(',', '.')) || 0 : item.preco
      }))
    };

    const sucesso = await atualizarOrcamento(orcamentoTratado.id, orcamentoTratado);
    if (sucesso) {
      setSelectedOrcamento(orcamentoTratado);
      setEditMode(false);
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setEditedOrcamento(null);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!novoItemNome.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      nome: novoItemNome,
      qtd: parseInt(novoItemQtd) || 1,
      preco: parseFloat(novoItemPreco) || 0
    };

    setEditedOrcamento({
      ...editedOrcamento,
      itens: [...(editedOrcamento.itens || []), newItem]
    });
    
    setNovoItemNome('');
    setNovoItemQtd(1);
    setNovoItemPreco('');
  };

  const handleRemoveItem = (itemId) => {
    setEditedOrcamento({
      ...editedOrcamento,
      itens: editedOrcamento.itens.filter(i => i.id !== itemId)
    });
  };

  const handleUpdateItem = (index, field, value) => {
    setEditedOrcamento(prev => ({
      ...prev,
      itens: prev.itens.map((i, idx) => idx === index ? { ...i, [field]: value } : i)
    }));
  };

  return (
    <div className="grid md:grid-cols-3 gap-6">
      
      {/* Lista de Orçamentos */}
      <div className="card md:col-span-1 no-print" style={{ display: 'flex', flexDirection: 'column', maxHeight: '70vh', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Orçamentos</h2>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }} onClick={handleNovoOrcamento}>
            <Plus size={18} /> Criar
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {orcamentos.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '2rem' }}>Nenhum orçamento criado.</p>
          ) : (
            orcamentos.map(orc => (
              <div 
                key={orc.id} 
                onClick={() => {
                  if(!editMode) setSelectedOrcamento(orc);
                }}
                style={{ 
                  padding: '1rem', 
                  borderRadius: 'var(--radius-md)', 
                  cursor: editMode ? 'not-allowed' : 'pointer',
                  border: selectedOrcamento?.id === orc.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                  backgroundColor: 'var(--color-surface-hover)',
                  opacity: editMode && selectedOrcamento?.id !== orc.id ? 0.5 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 600 }}>{orc.cliente || 'Cliente (Pendente)'}</span>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', backgroundColor: getStatusColor(orc.status), color: 'white', fontWeight: 'bold' }}>
                    {orc.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  {new Date(orc.data).toLocaleDateString('pt-BR')} - {orc.itens?.length || 0} itens
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Detalhes do Orçamento */}
      <div className="card md:col-span-2" style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!selectedOrcamento ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--color-text-muted)' }}>
            <FileText size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>Selecione um orçamento ao lado para ver os detalhes</p>
          </div>
        ) : editMode ? (
          /* MODO DE EDIÇÃO */
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Editando Orçamento</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button className="btn btn-outline" onClick={handleCancelEdit}>
                  <X size={18} /> Cancelar
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  <Save size={18} /> Salvar Orçamento
                </button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4" style={{ marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Cliente</label>
                <input type="text" className="input" style={{ width: '100%', padding: '0.5rem' }} value={editedOrcamento.cliente} onChange={e => setEditedOrcamento({...editedOrcamento, cliente: e.target.value})} placeholder="Nome do cliente" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Telefone/WhatsApp</label>
                <input type="text" className="input" style={{ width: '100%', padding: '0.5rem' }} value={editedOrcamento.telefone} onChange={e => setEditedOrcamento({...editedOrcamento, telefone: e.target.value})} placeholder="(00) 00000-0000" />
              </div>
              <div className="col-span-2">
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Veículo</label>
                <input type="text" className="input" style={{ width: '100%', padding: '0.5rem' }} value={editedOrcamento.veiculo} onChange={e => setEditedOrcamento({...editedOrcamento, veiculo: e.target.value})} placeholder="Carro/Modelo" />
              </div>
            </div>

            <div style={{ marginBottom: '2rem', flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Itens do Orçamento</h3>
              
              <form onSubmit={handleAddItem} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <input type="text" className="input" style={{ flex: '1 1 200px', padding: '0.5rem' }} placeholder="Nome da peça" value={novoItemNome} onChange={e => setNovoItemNome(e.target.value)} />
                <input type="number" className="input" style={{ width: '80px', padding: '0.5rem' }} min="1" placeholder="Qtd" value={novoItemQtd} onChange={e => setNovoItemQtd(e.target.value)} />
                <input type="number" step="0.01" className="input" style={{ width: '100px', padding: '0.5rem' }} placeholder="Preço (R$)" value={novoItemPreco} onChange={e => setNovoItemPreco(e.target.value)} />
                <button type="submit" className="btn btn-outline" style={{ padding: '0.5rem' }}><Plus size={18} /></button>
              </form>

              {(!editedOrcamento.itens || editedOrcamento.itens.length === 0) ? (
                <div style={{ padding: '1rem', textAlign: 'center', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ color: 'var(--color-text-muted)' }}>Nenhum item adicionado.</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '400px' }}>
                    <thead style={{ backgroundColor: 'var(--color-surface-hover)' }}>
                      <tr>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>Peça</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', width: '60px', textAlign: 'center' }}>Qtd</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', width: '100px', textAlign: 'right' }}>Preço</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', width: '50px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editedOrcamento.itens.map((item, idx) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '0.5rem' }}>
                            <input type="text" className="input" style={{ width: '100%', padding: '0.25rem' }} value={item.nome} onChange={e => handleUpdateItem(idx, 'nome', e.target.value)} />
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <input type="number" className="input" style={{ width: '60px', padding: '0.25rem', textAlign: 'center' }} min="1" value={item.qtd || ''} onChange={e => handleUpdateItem(idx, 'qtd', e.target.value)} />
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                            <input type="text" className="input" style={{ width: '100px', padding: '0.25rem', textAlign: 'right' }} placeholder="0,00" value={item.preco !== undefined ? item.preco : ''} onChange={e => handleUpdateItem(idx, 'preco', e.target.value)} />
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                            <button className="btn btn-outline" style={{ color: 'var(--color-danger)', border: 'none', padding: '0.25rem' }} onClick={() => handleRemoveItem(item.id)}>
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
          </>
        ) : (
          /* MODO DE VISUALIZAÇÃO */
          <>
            {/* Cabeçalho de Impressão */}
            <div className="print-only" style={{ marginBottom: '2rem', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
              <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>AutoPeças ERP - Orçamento de Peças</h1>
              <div style={{ display: 'flex', justifyContent: 'space-between', textAlign: 'left', marginTop: '1rem', fontSize: '14px', color: '#333' }}>
                <div>
                  <strong>Data:</strong> {new Date(selectedOrcamento.data).toLocaleDateString('pt-BR')}<br/>
                  <strong>Cliente:</strong> {selectedOrcamento.cliente || 'Não informado'}<br/>
                  <strong>Contato:</strong> {selectedOrcamento.telefone || 'Não informado'}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Orçamento ID:</strong> {selectedOrcamento.id || 'N/A'}<br/>
                  <strong>Veículo:</strong> {selectedOrcamento.veiculo || 'Não informado'}
                </div>
              </div>
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Orçamento: {selectedOrcamento.cliente || 'Pendente / Não informado'}
                </h2>
                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  <span><MessageCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {selectedOrcamento.telefone || 'Sem telefone'}</span>
                  <span>Veículo: {selectedOrcamento.veiculo || 'Não informado'}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={handleEditClick} title="Editar Orçamento">
                  <Edit size={18} /> Editar
                </button>
                <button className="btn btn-outline" onClick={() => window.print()} title="Gerar PDF / Imprimir">
                  <Printer size={18} /> PDF / Imprimir
                </button>
                <button className="btn btn-primary" onClick={() => copiarLink(selectedOrcamento.token)} title="Copiar Link para enviar">
                  <Copy size={18} /> Link
                </button>
                <a href={`/orcamento/${selectedOrcamento.token}`} target="_blank" rel="noreferrer" className="btn btn-outline" title="Ver como Cliente">
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>

            <div style={{ marginBottom: '2rem', flex: 1 }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Itens do Orçamento</h3>
              
              {(!selectedOrcamento.itens || selectedOrcamento.itens.length === 0) ? (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)' }}>
                  <p style={{ color: 'var(--color-text-muted)' }}>O orçamento está vazio. Clique em Editar para adicionar peças ou envie o link para o cliente.</p>
                </div>
              ) : (
                <div className="table-responsive" style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', minWidth: '400px' }}>
                    <thead style={{ backgroundColor: 'var(--color-surface-hover)' }}>
                      <tr>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)' }}>Descrição / Peça</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', width: '80px', textAlign: 'center' }}>Qtd</th>
                        <th style={{ padding: '0.75rem', borderBottom: '1px solid var(--color-border)', width: '120px', textAlign: 'right' }}>Preço Unt.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrcamento.itens.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 500 }}>{item.nome}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>{item.qtd}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>R$ {Number(item.preco || 0).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan="2" style={{ padding: '1rem 0.75rem', fontWeight: 'bold', textAlign: 'right', borderTop: '2px solid var(--color-border)' }}>Total Aproximado:</td>
                        <td style={{ padding: '1rem 0.75rem', fontWeight: 'bold', textAlign: 'right', borderTop: '2px solid var(--color-border)', color: 'var(--color-primary)' }}>
                          R$ {selectedOrcamento.itens.reduce((acc, item) => acc + (Number(item.preco || 0) * Number(item.qtd || 1)), 0).toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: 'auto' }}>
              <select 
                className="input" 
                value={selectedOrcamento.status}
                onChange={(e) => {
                  const newStatus = e.target.value;
                  atualizarOrcamento(selectedOrcamento.id, { status: newStatus });
                  setSelectedOrcamento({...selectedOrcamento, status: newStatus});
                }}
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
              >
                <option value="Pendente">Pendente (Aguardando)</option>
                <option value="Respondido">Respondido / Enviado</option>
                <option value="Aprovado">Aprovado (Venda Fechada)</option>
                <option value="Rejeitado">Rejeitado</option>
                <option value="Finalizado">Finalizado</option>
              </select>

              <button 
                className="btn btn-outline" 
                style={{ color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}
                onClick={() => {
                  if(window.confirm('Tem certeza que deseja excluir este orçamento?')) {
                    deletarOrcamento(selectedOrcamento.id);
                    setSelectedOrcamento(null);
                  }
                }}
              >
                <Trash2 size={18} /> Excluir
              </button>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
