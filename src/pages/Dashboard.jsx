import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, DollarSign, AlertTriangle, Play, ShoppingCart, Plus, Car } from 'lucide-react';
import Skeleton from '../components/ui/Skeleton';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// Tooltip customizado para mostrar as duas informações sem precisar renderizar duas linhas
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ backgroundColor: 'var(--color-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-md)' }}>
        <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{label}</p>
        <p style={{ color: 'var(--color-primary)', fontWeight: 600, margin: 0 }}>
          Faturamento: R$ {data.Vendas.toFixed(2)}
        </p>
        <p style={{ color: 'var(--color-success)', fontWeight: 600, margin: 0, marginTop: '0.25rem' }}>
          Peças Vendidas: {data.Pecas} un
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { estoque, metricas, vendasHistorico } = useAppContext();
  const [loading, setLoading] = useState(true);

  const totalPecas = estoque.reduce((acc, p) => acc + p.qtd, 0);
  const totalValorEstoque = estoque.reduce((acc, p) => acc + (p.qtd * (p.preco || 0)), 0);
  const baixoEstoque = estoque.filter(p => p.qtd === 0).length;

  // Prepare chart data (Last 7 Days)
  const chartData = useMemo(() => {
    const data = [];
    const now = new Date();
    for(let i=6; i>=0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD
      const shortDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
      
      let sumVal = 0;
      let sumQtd = 0;
      
      (vendasHistorico || []).forEach(v => {
        if(v.data.startsWith(dateString)) {
          sumVal += v.total;
          sumQtd += v.itens.reduce((iAcc, item) => iAcc + (parseInt(item.qtd) || 0), 0);
        }
      });
      
      data.push({
        name: shortDate,
        Vendas: sumVal,
        Pecas: sumQtd
      });
    }
    return data;
  }, [vendasHistorico]);

  // Simulating offline-first mindset / data fetching
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>Visão Geral</h1>
          <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>Acompanhe o fluxo da loja e do pátio.</p>
        </div>
      </header>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-3" style={{ marginBottom: '2rem' }}>
        <MetricCard loading={loading} title="Total de Peças Físicas" value={totalPecas} subtitle={`R$ ${totalValorEstoque.toFixed(2)} em estoque`} icon={<Package size={24} color="var(--color-primary)" />} />
        <MetricCard loading={loading} title="Valor em Caixa" value={`R$ ${metricas.valorCaixa.toFixed(2)}`} icon={<DollarSign size={24} color="var(--color-success)" />} />
        <Link to="/pedidos" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
          <MetricCard loading={loading} title="Peças Esgotadas" value={`${baixoEstoque} itens`} icon={<AlertTriangle size={24} color={baixoEstoque > 0 ? "var(--color-danger)" : "var(--color-text-muted)"} />} highlight={baixoEstoque > 0} hoverable={true} />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3" style={{ marginBottom: '2rem' }}>
        {/* Chart */}
        <div className="card md:col-span-2">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Faturamento (Últimos 7 Dias)</h2>
          {loading ? (
             <Skeleton style={{ height: '300px', width: '100%' }} />
          ) : (
            <div style={{ width: '100%', height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--color-primary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `R$${val}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Vendas" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorVendas)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card md:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Ações Rápidas</h2>
          
          <Link to="/pdv" className="btn btn-primary" style={{ justifyContent: 'flex-start' }}>
            <ShoppingCart size={20} /> Vender (PDV)
          </Link>
          <Link to="/financeiro" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <DollarSign size={20} /> Ver Financeiro
          </Link>
          <Link to="/estoque" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <Plus size={20} /> Nova Peça
          </Link>
          <Link to="/desmanche" className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
            <Car size={20} /> Novo Veículo Doador
          </Link>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, icon, loading, highlight, hoverable }) {
  return (
    <div className={`card ${hoverable ? 'hover-scale' : ''}`} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '1.5rem',
      border: highlight ? '1px solid var(--color-danger)' : '1px solid var(--color-border)',
      cursor: hoverable ? 'pointer' : 'default',
      transition: 'transform 0.2s, box-shadow 0.2s'
    }}>
      <div style={{ 
        width: '56px', height: '56px', 
        borderRadius: 'var(--radius-md)', 
        backgroundColor: 'var(--color-surface-hover)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>{title}</p>
        {loading ? (
          <Skeleton style={{ height: '28px', width: '60%', marginTop: '0.25rem' }} />
        ) : (
          <>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, marginTop: '0.25rem', color: highlight ? 'var(--color-danger)' : 'var(--color-text)' }}>
              {value}
            </p>
            {subtitle && (
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem', fontWeight: 500 }}>
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
