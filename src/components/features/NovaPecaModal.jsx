import React, { useState, useRef } from 'react';
import { Camera, QrCode, Save, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import Modal from '../ui/Modal';
import CameraCapture from '../ui/CameraCapture';

export default function NovaPecaModal({ isOpen, onClose }) {
  const { addPeca, showToast } = useAppContext();
  
  const [formData, setFormData] = useState({
    nome: '', categoria: 'Carroceria e Lataria', condicao: 'Usada (Bom Estado)', veiculoId: '', oem: '', local: '', foto: null, qtd: 1, preco: ''
  });

  const [activeAlert, setActiveAlert] = useState(null); // To show custom modal alerts
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({...formData, foto: reader.result});
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if(!formData.nome) {
      showToast('O nome da peça é obrigatório', 'error');
      return;
    }
    
    addPeca({
      nome: formData.nome,
      oem: formData.oem || '-',
      condicao: formData.condicao,
      qtd: parseInt(formData.qtd) || 1,
      preco: parseFloat(formData.preco) || 0,
      local: formData.local || 'Não definido',
      color: 'var(--color-primary)', // default badge color
      veiculoId: formData.veiculoId || null,
      foto: formData.foto
    });

    showToast('Peça salva no estoque com sucesso!');
    // Reset form
    setFormData({ nome: '', categoria: 'Carroceria e Lataria', condicao: 'Usada (Bom Estado)', veiculoId: '', oem: '', local: '', foto: null, qtd: 1, preco: '' });
    onClose(); // Close the modal after saving
  };

  // We do not render anything if the main modal is closed
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Nova Peça" maxWidth="600px">
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '1rem' }}>
        {/* Mídia - Câmera Gigante */}
        <div style={{ 
          backgroundColor: 'var(--color-surface-hover)', 
          border: formData.foto ? 'none' : '2px dashed var(--color-border)', 
          borderRadius: 'var(--radius-lg)', 
          padding: formData.foto ? '0' : '2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          cursor: 'pointer',
          overflow: 'hidden',
          position: 'relative',
          minHeight: '200px'
        }}
        onClick={() => !formData.foto && setIsCameraOpen(true)}
        >
          {formData.foto ? (
            <>
              <img src={formData.foto} alt="Peça capturada" style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', display: 'block' }} />
              <button 
                type="button" 
                onClick={(e) => { e.stopPropagation(); setFormData({...formData, foto: null}); }}
                style={{ position: 'absolute', top: '1rem', right: '1rem', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.5rem', borderRadius: '50%' }}
              >
                <Trash2 size={20} />
              </button>
            </>
          ) : (
            <>
              <div style={{ 
                backgroundColor: 'rgba(234, 88, 12, 0.1)', 
                padding: '1.5rem', 
                borderRadius: 'var(--radius-full)' 
              }}>
                <Camera size={48} color="var(--color-accent)" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <span style={{ display: 'block', fontWeight: 600, fontSize: '1.125rem' }}>Tirar Foto da Peça</span>
                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Toque para abrir a câmera (Obrigatório)</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                 <input 
                   type="file" 
                   accept="image/*" 
                   ref={fileInputRef} 
                   style={{ display: 'none' }} 
                   onChange={handleFileChange}
                 />
                 <button type="button" className="btn btn-outline" style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                   <ImageIcon size={16} /> Escolher da Galeria
                 </button>
              </div>
            </>
          )}
        </div>

        {/* Informações Básicas */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Informações Rápidas</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Nome da Peça</label>
              <input type="text" placeholder="Ex: Farol Direito LED" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Preço de Venda (R$)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={formData.preco} onChange={e => setFormData({...formData, preco: e.target.value})} />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Categoria</label>
              <select value={formData.categoria} onChange={e => setFormData({...formData, categoria: e.target.value})}>
                <option>Acabamento Externo</option>
                <option>Acabamento Interno</option>
                <option>Acessórios</option>
                <option>Alimentação de Combustível</option>
                <option>Ar Condicionado e Ventilação</option>
                <option>Arrefecimento</option>
                <option>Bancos e Assentos</option>
                <option>Cabos</option>
                <option>Câmbio e Embreagem</option>
                <option>Carroceria e Lataria</option>
                <option>Chassi e Estrutura</option>
                <option>Cintos e Segurança</option>
                <option>Direção</option>
                <option>Elétrica e Sensores</option>
                <option>Escapamento</option>
                <option>Faróis e Lanternas</option>
                <option>Filtros</option>
                <option>Freios</option>
                <option>Ignição</option>
                <option>Injeção Eletrônica</option>
                <option>Motor e Componentes Internos</option>
                <option>Painel e Instrumentos</option>
                <option>Pneus e Rodas</option>
                <option>Som e Multimídia</option>
                <option>Suspensão e Amortecedores</option>
                <option>Transmissão e Eixo</option>
                <option>Vidros e Máquinas de Vidro</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Condição</label>
              <select value={formData.condicao} onChange={e => setFormData({...formData, condicao: e.target.value})}>
                <option>Usada (Bom Estado)</option>
                <option>Nova</option>
                <option>Recuperada</option>
                <option>Com Defeito</option>
              </select>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Quantidade</label>
              <input type="number" min="1" value={formData.qtd} onChange={e => setFormData({...formData, qtd: parseInt(e.target.value) || ''})} />
            </div>
          </div>
        </div>

        {/* Rastreabilidade */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Rastreabilidade</h2>
          
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Veículo Doador (ID)</label>
            <input type="text" placeholder="Ex: V-100" value={formData.veiculoId} onChange={e => setFormData({...formData, veiculoId: e.target.value})} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Código Original (OEM)</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="text" placeholder="Ex: 33100-TBA-A11" style={{ flex: 1 }} value={formData.oem} onChange={e => setFormData({...formData, oem: e.target.value})} />
              <button type="button" className="btn btn-outline" style={{ padding: '0.75rem' }} title="Escanear Código de Barras da Peça" onClick={() => setActiveAlert({ title: 'Scanner', message: 'Simulando a leitura de um Código de Barras na embalagem da peça.' })}>
                <QrCode size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Localização Física */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Localização Física</h2>
          
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
             <div style={{ flex: 1 }}>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Prateleira / Corredor</label>
               <input type="text" placeholder="Ex: A-12-Prat3" value={formData.local} onChange={e => setFormData({...formData, local: e.target.value})} />
             </div>
             <button type="button" className="btn btn-primary" style={{ padding: '0.75rem', height: '46px' }} title="Escanear QR Code da Prateleira" onClick={() => setActiveAlert({ title: 'Scanner QR', message: 'Simulando a leitura de um QR Code fixado na prateleira para preencher o local automaticamente.' })}>
                <QrCode size={20} />
             </button>
          </div>
        </div>

        <button type="button" className="btn btn-accent" style={{ padding: '1rem', fontSize: '1.125rem', marginTop: '1.5rem' }} onClick={handleSave}>
          <Save size={24} /> Salvar Peça no Estoque
        </button>

      </form>

      {/* Modal Simulador */}
      <Modal isOpen={!!activeAlert} onClose={() => setActiveAlert(null)} title={activeAlert?.title} maxWidth="400px">
        <p style={{ marginBottom: '1.5rem' }}>{activeAlert?.message}</p>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={() => setActiveAlert(null)}>Ok, Fechar</button>
        </div>
      </Modal>

      {/* Câmera Real */}
      <CameraCapture 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={(photoData) => setFormData({...formData, foto: photoData})}
      />
    </Modal>
  );
}
