import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserPlus, Shield, Edit, Trash2, ShieldAlert, Activity, Users } from 'lucide-react';
import Modal from '../components/ui/Modal';

export default function Acesso() {
  const { currentUser, usuarios, fetchUsuarios, addUsuario, updateUsuario, deleteUsuario, logs, fetchLogs } = useAppContext();
  
  const [activeTab, setActiveTab] = useState('usuarios');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'balcao'
  });

  // Proteção de Rota Visual
  if (currentUser?.role !== 'boss') {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', marginTop: '10vh' }}>
        <ShieldAlert size={80} color="var(--color-danger)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ color: 'var(--color-danger)' }}>Acesso Negado</h2>
        <p style={{ color: 'var(--color-text-muted)', maxWidth: '400px', margin: '0 auto' }}>
          Esta área é restrita para o cargo de Gerência. Você não tem permissão para visualizar ou gerenciar os usuários do sistema.
        </p>
      </div>
    );
  }

  useEffect(() => {
    fetchLogs();
    fetchUsuarios();
  }, []);

  const openModalForNew = () => {
    setEditingUser(null);
    setFormData({ username: '', password: '', role: 'balcao' });
    setIsModalOpen(true);
  };

  const openModalForEdit = (user) => {
    setEditingUser(user);
    // Nota: Em um sistema real, a senha não viria do backend (viria hashada). 
    // Como é MVP e salvamos raw text, preenchemos o form para facilitar.
    setFormData({ username: user.username, password: user.password || '', role: user.role });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      deleteUsuario(id);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUsuario({ id: editingUser.id, ...formData });
    } else {
      addUsuario(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="fade-in" style={{ padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield size={32} color="var(--color-primary)" />
            Controle de Acesso
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>Gerencie as contas e visualize o histórico de atividades.</p>
        </div>
        {activeTab === 'usuarios' && (
          <button className="btn btn-primary" onClick={openModalForNew}>
            <UserPlus size={20} />
            Novo Usuário
          </button>
        )}
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button 
          className={`btn ${activeTab === 'usuarios' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('usuarios')}
        >
          <Users size={18} />
          Usuários
        </button>
        <button 
          className={`btn ${activeTab === 'logs' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => { setActiveTab('logs'); fetchLogs(); }}
        >
          <Activity size={18} />
          Auditoria (Logs)
        </button>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          {activeTab === 'usuarios' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem' }}>Usuário</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Último Acesso</th>
                  <th style={{ padding: '1rem' }}>Nível de Acesso</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
            <tbody>
              {usuarios.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{user.username}</td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: user.isOnline ? 'var(--color-success)' : 'var(--color-text-muted)' }}></div>
                      <span style={{ fontSize: '0.875rem', color: user.isOnline ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                        {user.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca acessou'}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '99px', 
                      fontSize: '0.875rem',
                      backgroundColor: user.role === 'boss' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                      color: user.role === 'boss' ? '#10B981' : '#3B82F6',
                      fontWeight: 600
                    }}>
                      {user.role === 'boss' ? 'Gerência' : 'Balcão'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button className="btn btn-outline" onClick={() => openModalForEdit(user)} style={{ marginRight: '0.5rem', padding: '0.5rem' }} title="Editar">
                      <Edit size={18} />
                    </button>
                    <button className="btn btn-outline" onClick={() => handleDelete(user.id)} style={{ padding: '0.5rem', color: 'var(--color-danger)', borderColor: 'var(--color-danger)' }} title="Excluir">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}

          {activeTab === 'logs' && (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem' }}>Data/Hora</th>
                  <th style={{ padding: '1rem' }}>Usuário</th>
                  <th style={{ padding: '1rem' }}>Ação</th>
                  <th style={{ padding: '1rem' }}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{log.usuario}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: 'var(--radius-sm)', 
                        fontSize: '0.75rem',
                        backgroundColor: log.acao === 'Login' ? 'rgba(16, 185, 129, 0.1)' : log.acao === 'Logout' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: log.acao === 'Login' ? '#10B981' : log.acao === 'Logout' ? '#EF4444' : '#3B82F6',
                        fontWeight: 600
                      }}>
                        {log.acao}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{log.detalhes}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                      Nenhum registro de atividade encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label>Nome de Usuário</label>
            <input 
              type="text" 
              required 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
              placeholder="Ex: joao.silva"
            />
          </div>
          
          <div className="form-group">
            <label>Senha</label>
            <input 
              type="password" 
              required 
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
              placeholder="Digite a senha"
            />
          </div>

          <div className="form-group">
            <label>Nível de Acesso (Cargo)</label>
            <select 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}
            >
              <option value="balcao">Balcão (Acesso Padrão)</option>
              <option value="boss">Gerência (Acesso Total)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editingUser ? 'Salvar' : 'Criar'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
