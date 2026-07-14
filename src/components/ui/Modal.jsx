import React from 'react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = '500px' }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div className="card" style={{
        width: '100%', maxWidth, maxHeight: '90vh', overflowY: 'auto',
        backgroundColor: 'var(--color-surface)', position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-primary)' }}>{title}</h2>
          <button onClick={onClose} style={{ fontSize: '1.5rem', lineHeight: 1, padding: '0.25rem' }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
}
