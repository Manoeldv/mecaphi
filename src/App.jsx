import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Desmanche from './pages/Desmanche';
import Estoque from './pages/Estoque';
import PDV from './pages/PDV';
import Financeiro from './pages/Financeiro';
import Pedidos from './pages/Pedidos';
import Acesso from './pages/Acesso';
import Login from './pages/Login';
import OrcamentoForm from './pages/OrcamentoForm';

import { AppProvider, useAppContext } from './context/AppContext';

function AppContent() {
  const { currentUser } = useAppContext();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/orcamento/:token" element={<OrcamentoForm />} />

        {/* Protected Routes or Login */}
        <Route path="*" element={
          currentUser ? (
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="desmanche" element={<Desmanche />} />
                <Route path="estoque" element={<Estoque />} />
                <Route path="pdv" element={<PDV />} />
                <Route path="financeiro" element={<Financeiro />} />
                <Route path="pedidos" element={<Pedidos />} />
                <Route path="acesso" element={<Acesso />} />
              </Route>
            </Routes>
          ) : (
            <Login />
          )
        } />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
