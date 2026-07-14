import React, { useState } from 'react';
import { Search, Save, FileText, CheckCircle, Clock } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Desmanche() {
  const [activeTab, setActiveTab] = useState('cadastro');

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Módulo de Desmanche</h1>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Rastreabilidade e cadastro de veículos doadores.</p>
      </header>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('cadastro')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            borderBottom: activeTab === 'cadastro' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'cadastro' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'cadastro' ? 600 : 400
          }}
        >
          Dados do Veículo Doador
        </button>
        <button 
          onClick={() => setActiveTab('pecas')}
          style={{ 
            padding: '0.75rem 1.5rem', 
            borderBottom: activeTab === 'pecas' ? '3px solid var(--color-primary)' : '3px solid transparent',
            color: activeTab === 'pecas' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: activeTab === 'pecas' ? 600 : 400
          }}
        >
          Peças Vinculadas (Rastreabilidade)
        </button>
      </div>

      {activeTab === 'cadastro' ? <CadastroVeiculo /> : <PecasVinculadas />}
    </div>
  );
}

function CadastroVeiculo() {
  const { addVeiculo, showToast } = useAppContext();
  
  const [formData, setFormData] = useState({
    placa: '', chassi: '', marca: 'Honda', modelo: '', ano: '', cor: ''
  });

  const handleSave = () => {
    if(!formData.placa || !formData.modelo) {
      showToast('Preencha pelo menos placa e modelo.', 'error');
      return;
    }
    addVeiculo(formData);
    showToast('Veículo doador cadastrado com sucesso!');
    setFormData({ placa: '', chassi: '', marca: 'Honda', modelo: '', ano: '', cor: '' });
  };

  return (
    <div className="card">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Cadastrar Novo Doador</h2>
      
      <form className="grid gap-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Placa</label>
            <input type="text" placeholder="AAA-0000" value={formData.placa} onChange={e => setFormData({...formData, placa: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Chassi (VIN)</label>
            <input type="text" placeholder="17 caracteres..." value={formData.chassi} onChange={e => setFormData({...formData, chassi: e.target.value})} />
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Marca</label>
            <select value={formData.marca} onChange={e => setFormData({...formData, marca: e.target.value})}>
              <option>Agrale</option>
              <option>Alfa Romeo</option>
              <option>Aston Martin</option>
              <option>Audi</option>
              <option>BMW</option>
              <option>BYD</option>
              <option>CAOA Chery</option>
              <option>Chevrolet</option>
              <option>Chrysler</option>
              <option>Citroën</option>
              <option>Dodge</option>
              <option>Effa</option>
              <option>Ferrari</option>
              <option>Fiat</option>
              <option>Ford</option>
              <option>GWM</option>
              <option>Honda</option>
              <option>Hyundai</option>
              <option>JAC</option>
              <option>Jaguar</option>
              <option>Jeep</option>
              <option>Kia</option>
              <option>Land Rover</option>
              <option>Lexus</option>
              <option>Lifan</option>
              <option>Maserati</option>
              <option>Mercedes-Benz</option>
              <option>Mini</option>
              <option>Mitsubishi</option>
              <option>Nissan</option>
              <option>Peugeot</option>
              <option>Porsche</option>
              <option>RAM</option>
              <option>Renault</option>
              <option>SSANGYONG</option>
              <option>Subaru</option>
              <option>Suzuki</option>
              <option>Toyota</option>
              <option>Troller</option>
              <option>Volkswagen</option>
              <option>Volvo</option>
            </select>
          </div>
          <div className="md:col-span-1">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Modelo</label>
            <input type="text" placeholder="Ex: Civic EX" value={formData.modelo} onChange={e => setFormData({...formData, modelo: e.target.value})} />
          </div>
          <div className="md:col-span-1">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Ano</label>
            <input type="number" placeholder="2018" value={formData.ano} onChange={e => setFormData({...formData, ano: e.target.value})} />
          </div>
          <div className="md:col-span-1">
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500 }}>Cor</label>
            <input type="text" placeholder="Prata" value={formData.cor} onChange={e => setFormData({...formData, cor: e.target.value})} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
          <button type="button" className="btn btn-outline" onClick={() => setFormData({ placa: '', chassi: '', marca: 'Honda', modelo: '', ano: '', cor: '' })}>Cancelar</button>
          <button type="button" className="btn btn-primary" onClick={handleSave}><Save size={18} /> Salvar Doador</button>
        </div>
      </form>
    </div>
  );
}

function PecasVinculadas() {
  const { estoque, veiculos } = useAppContext();
  const doadorAtivo = veiculos.length > 0 ? veiculos[0] : null;
  
  const pecasDoador = doadorAtivo 
    ? estoque.filter(p => p.veiculoId === doadorAtivo.id)
    : [];

  if (!doadorAtivo) return <div className="card">Nenhum veículo cadastrado.</div>;

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{doadorAtivo.marca} {doadorAtivo.modelo} {doadorAtivo.ano} (Placa: {doadorAtivo.placa})</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{pecasDoador.length} peças cadastradas até o momento.</p>
        </div>
        <button className="btn btn-accent"><Search size={18} /> Vincular Nova Peça</button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>SKU</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Descrição</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>OEM</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>Localização</th>
            </tr>
          </thead>
          <tbody>
            {pecasDoador.map(peca => (
              <tr key={peca.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '1rem', fontWeight: 600 }}>{peca.id}</td>
                <td style={{ padding: '1rem' }}>{peca.nome}</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace' }}>{peca.oem}</td>
                <td style={{ padding: '1rem' }}>
                  <span className={`badge ${peca.qtd === 0 ? 'badge-danger' : 'badge-success'}`}>
                    {peca.qtd === 0 ? 'Vendido / Esgotado' : 'Em Estoque'}
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ backgroundColor: 'var(--color-surface-hover)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.875rem', fontWeight: 600 }}>
                    {peca.local}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
