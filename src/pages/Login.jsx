import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import './Login.css';

export default function Login() {
  const { login } = useAppContext();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(user, password);
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="animation-wrapper-logo">
        <div className="splash-group">
          <img src="/logo-.png" alt="Mecaphi Gear" className="gear-icon" />
          <img src="/logo.png" alt="Mecaphi Logo" className="full-logo" />
        </div>
      </div>

      <div className="animation-wrapper-form">
        <div className="login-form-container">
          <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E3A8A' }}>Acesso ao Sistema</h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Entre com suas credenciais de acesso</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Usuário</label>
              <input 
                type="text" 
                placeholder="Digite seu usuário" 
                value={user} 
                onChange={(e) => setUser(e.target.value)} 
                required 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.875rem' }}>Senha</label>
              <input 
                type="password" 
                placeholder="Digite sua senha" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', transition: 'all 0.3s ease', opacity: loading ? 0.7 : 1 }}>
              <LogIn size={20} /> {loading ? 'Autenticando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
