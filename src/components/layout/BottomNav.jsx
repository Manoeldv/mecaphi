import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Car, DollarSign } from 'lucide-react';

export default function BottomNav() {
  const links = [
    { to: '/', icon: <Home size={24} />, label: 'Início' },
    { to: '/estoque', icon: <Search size={24} />, label: 'Buscar' },
    // Câmera/Scanner occupies the central FAB position
    { to: '/desmanche', icon: <Car size={24} />, label: 'Desmanche' },
    // PDV is desktop only, so we omit it here, or perhaps link to generic profile.
  ];

  return (
    <nav className="bottom-nav notranslate" translate="no">
      <NavLink to="/" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', gap: '0.25rem'}}>
        <Home size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/estoque" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', gap: '0.25rem'}}>
        <Search size={24} />
        <span>Buscar</span>
      </NavLink>

      <NavLink to="/desmanche" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', gap: '0.25rem'}}>
        <Car size={24} />
        <span>Desmanche</span>
      </NavLink>
      <NavLink to="/financeiro" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', gap: '0.25rem'}}>
        <DollarSign size={24} />
        <span>Caixa</span>
      </NavLink>
    </nav>
  );
}
