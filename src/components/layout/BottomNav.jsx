import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Car, Camera, DollarSign } from 'lucide-react';
import CameraCapture from '../ui/CameraCapture';

export default function BottomNav() {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const links = [
    { to: '/', icon: <Home size={24} />, label: 'Início' },
    { to: '/estoque', icon: <Search size={24} />, label: 'Buscar' },
    // Câmera/Scanner occupies the central FAB position
    { to: '/desmanche', icon: <Car size={24} />, label: 'Desmanche' },
    // PDV is desktop only, so we omit it here, or perhaps link to generic profile.
  ];

  return (
    <nav className="bottom-nav">
      <NavLink to="/" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', gap: '0.25rem'}}>
        <Home size={24} />
        <span>Início</span>
      </NavLink>
      <NavLink to="/estoque" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', gap: '0.25rem'}}>
        <Search size={24} />
        <span>Buscar</span>
      </NavLink>
      
      {/* Central FAB for Camera/Scanner */}
      <div style={{ position: 'relative', top: '-1.5rem' }}>
        <button 
          style={{
            backgroundColor: 'var(--color-accent)',
            color: 'white',
            width: '60px',
            height: '60px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-fab)'
          }}
          onClick={() => setIsCameraOpen(true)}
        >
          <Camera size={28} />
        </button>
      </div>

      <NavLink to="/desmanche" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', gap: '0.25rem'}}>
        <Car size={24} />
        <span>Desmanche</span>
      </NavLink>

      <NavLink to="/financeiro" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--color-text-muted)', fontSize: '0.75rem', gap: '0.25rem'}}>
        <DollarSign size={24} />
        <span>Caixa</span>
      </NavLink>

      <CameraCapture 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)} 
        onCapture={(photo) => {
          // You could save this globally or navigate to a specific page
          // For now we just close it since it's a global shortcut button.
        }}
      />
    </nav>
  );
}
