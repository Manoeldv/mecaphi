import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { LogOut } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export default function Layout() {
  const { logout } = useAppContext();

  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content" style={{ position: 'relative' }}>
        <header className="mobile-header d-md-none" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <img src="/logo.png" alt="Mecaphi" style={{ height: '30px', mixBlendMode: 'multiply' }} />
          <button onClick={logout} className="btn" style={{ padding: '0.5rem', color: 'var(--color-danger)' }}>
            <LogOut size={20} />
          </button>
        </header>
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
