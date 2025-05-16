import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import DashboardMesero from './roles/mesero/DashboardMesero';
import CajaDashboard from './roles/caja/CajaDashboard';
import CocinaPanel from './roles/cocina/CocinaPanel';
import PanelGerencia from './roles/gerencia/PanelGerencia';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/mesero"
          element={
            <PrivateRoute allowedRoles={['mesero']}>
              <DashboardMesero />
            </PrivateRoute>
          }
        />
        <Route
          path="/caja"
          element={
            <PrivateRoute allowedRoles={['caja']}>
              <CajaDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/cocina"
          element={
            <PrivateRoute allowedRoles={['cocina']}>
              <CocinaPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/gerencia"
          element={
            <PrivateRoute allowedRoles={['gerente']}>
              <PanelGerencia />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;