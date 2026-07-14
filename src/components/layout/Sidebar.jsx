import { NavLink } from 'react-router-dom';
import { Home, Search, Car, ShoppingCart, DollarSign, ClipboardList, LogOut, Shield } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Sidebar() {
  const links = [
    { to: '/', icon: <Home size={20} />, label: 'Home' },
    { to: '/estoque', icon: <Search size={20} />, label: 'Estoque / Busca' },
    { to: '/desmanche', icon: <Car size={20} />, label: 'Desmanche' },
    { to: '/pdv', icon: <ShoppingCart size={20} />, label: 'PDV / Vendas' },
    { to: '/financeiro', icon: <DollarSign size={20} />, label: 'Financeiro' },
    { to: '/pedidos', icon: <ClipboardList size={20} />, label: 'Reposição' },
  ];

  const { currentUser, logout } = useAppContext();

  // Se for boss, adiciona o link de acesso ao final
  if (currentUser?.role === 'boss') {
    links.push({ to: '/acesso', icon: <Shield size={20} />, label: 'Acesso (Gerência)' });
  }

  return (
    <aside className="sidebar">
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <img src="/logo.png" alt="Mecaphi Logo" style={{ maxHeight: '100px', width: '100%', objectFit: 'contain', mixBlendMode: 'multiply', transform: 'scale(1.3)' }} />
      </div>
      <nav style={{ flex: 1, padding: '1rem 0' }}>
        <ul style={{ listStyle: 'none' }}>
          {links.map((link) => (
            <li key={link.to}>
              <NavLink 
                to={link.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1.5rem',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  backgroundColor: isActive ? 'rgba(30, 58, 138, 0.1)' : 'transparent',
                  fontWeight: isActive ? 600 : 400,
                  borderRight: isActive ? '3px solid var(--color-primary)' : '3px solid transparent'
                })}
              >
                {link.icon}
                <span>{link.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div style={{ padding: '1rem', borderTop: '1px solid var(--color-border)', fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ display: 'block', fontWeight: 600, color: 'var(--color-text)' }}>{currentUser?.username || 'Desconhecido'}</span>
          <span style={{ fontSize: '0.75rem' }}>{currentUser?.role === 'boss' ? 'Gerência' : 'Balcão'}</span>
        </div>
        <button onClick={logout} className="btn btn-outline" style={{ padding: '0.5rem', border: 'none', color: 'var(--color-danger)' }} title="Sair do Sistema">
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
