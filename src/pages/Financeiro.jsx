import React, { useState, useMemo } from 'react';
import { DollarSign, Printer, Filter, TrendingUp, ShoppingBag, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Financeiro() {
  const { vendasHistorico } = useAppContext();
  const [filterDate, setFilterDate] = useState('Todos'); // 'Hoje', '7Dias', 'Mes', 'Todos', 'Custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filtragem de Dados
  const filteredVendas = useMemo(() => {
    const now = new Date();
    return vendasHistorico.filter(venda => {
      if (filterDate === 'Todos') return true;
      const vendaDate = new Date(venda.data);
      const diffTime = Math.abs(now - vendaDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (filterDate === 'Hoje') {
        return vendaDate.toDateString() === now.toDateString();
      }
      if (filterDate === '7Dias') {
        return diffDays <= 7;
      }
      if (filterDate === 'Mes') {
        return vendaDate.getMonth() === now.getMonth() && vendaDate.getFullYear() === now.getFullYear();
      }
      if (filterDate === 'Custom') {
        // Ignora a hora para a comparação, usando T00:00:00 e T23:59:59 para pegar os dias inteiros
        const d = vendaDate.getTime();
        const start = startDate ? new Date(`${startDate}T00:00:00`).getTime() : 0;
        const end = endDate ? new Date(`${endDate}T23:59:59`).getTime() : Infinity;
        return d >= start && d <= end;
      }
      return true;
    });
  }, [vendasHistorico, filterDate, startDate, endDate]);

  // Cálculos de Resumo
  const totalReceita = filteredVendas.reduce((acc, venda) => acc + venda.total, 0);
  const totalVendasCount = filteredVendas.length;
  const ticketMedio = totalVendasCount > 0 ? totalReceita / totalVendasCount : 0;

  const handlePrint = () => {
    window.print();
  };

  const formatData = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto', paddingBottom: isMobile ? '5rem' : '2rem', overflowX: 'hidden' }}>
      
      {/* Botões de Ação Ocultos na Impressão */}
      <header className="no-print" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={28} /> Financeiro
          </h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Acompanhamento de vendas e faturamento</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={20} /> Exportar Relatório (PDF)
          </button>
        </div>
      </header>

      {/* Cabeçalho de Impressão (Só aparece no PDF) */}
      <div className="print-only" style={{ marginBottom: '2rem', textAlign: 'center', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
        <h1 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>AutoPeças ERP - Relatório Financeiro</h1>
        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Período: {filterDate === 'Todos' ? 'Todo o Histórico' : filterDate}</p>
        <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>Gerado em: {new Date().toLocaleString('pt-BR')}</p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--color-success)' }}>
          <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <TrendingUp size={24} color="var(--color-success)" />
          </div>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Receita do Período</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>R$ {totalReceita.toFixed(2)}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--color-primary)' }}>
          <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <ShoppingBag size={24} color="var(--color-primary)" />
          </div>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Vendas Realizadas</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>{totalVendasCount}</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '50%' }}>
            <DollarSign size={24} color="var(--color-warning)" />
          </div>
          <div>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Ticket Médio</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)' }}>R$ {ticketMedio.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card no-print" style={{ marginBottom: '2rem', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '1.5rem', alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
          <Filter size={20} /> Filtros:
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: isMobile ? 'space-between' : 'flex-start' }}>
          <button className={`btn ${filterDate === 'Hoje' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterDate('Hoje')}>Hoje</button>
          <button className={`btn ${filterDate === '7Dias' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterDate('7Dias')}>Últimos 7 Dias</button>
          <button className={`btn ${filterDate === 'Mes' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterDate('Mes')}>Este Mês</button>
          <button className={`btn ${filterDate === 'Todos' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilterDate('Todos')}>Todo o Histórico</button>
        </div>

        <div style={{ width: '1px', height: '2rem', backgroundColor: 'var(--color-border)', margin: '0 0.5rem' }} className="hidden-mobile"></div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-muted)' }}>Período Exato:</span>
          <input 
            type="date" 
            className="btn-outline" 
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: filterDate === 'Custom' ? 'rgba(30, 58, 138, 0.05)' : 'var(--color-surface)' }}
            value={startDate}
            onChange={e => { setStartDate(e.target.value); setFilterDate('Custom'); }}
          />
          <span style={{ color: 'var(--color-text-muted)' }}>até</span>
          <input 
            type="date" 
            className="btn-outline" 
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: filterDate === 'Custom' ? 'rgba(30, 58, 138, 0.05)' : 'var(--color-surface)' }}
            value={endDate}
            onChange={e => { setEndDate(e.target.value); setFilterDate('Custom'); }}
          />
        </div>
      </div>

      {/* Tabela de Vendas */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} color="var(--color-primary)" /> Histórico de Transações
          </h2>
        </div>
        <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table style={{ width: '100%', minWidth: '600px', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--color-surface-hover)' }}>
              <tr>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Transação</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Data e Hora</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Itens Vendidos</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Forma Pagamento</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--color-border)', textAlign: 'right' }}>Total (R$)</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendas.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Nenhuma venda registrada neste período.
                  </td>
                </tr>
              ) : (
                filteredVendas.map((venda) => (
                  <tr key={venda.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{venda.id}</td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>{formatData(venda.data)}</td>
                    <td style={{ padding: '1rem' }}>
                      <ul style={{ margin: 0, paddingLeft: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        {venda.itens.map((item, i) => (
                          <li key={i}>{item.qtd}x {item.nome}</li>
                        ))}
                      </ul>
                    </td>
                    <td style={{ padding: '1rem' }}><span className="badge badge-success">{venda.metodo}</span></td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-success)' }}>
                      R$ {venda.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
