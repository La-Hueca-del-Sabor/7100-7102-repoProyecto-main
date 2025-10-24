import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import DashboardMesero from './roles/mesero/DashboardMesero';
import CajaDashboard from './roles/caja/CajaDashboard';
import CocinaPanel from './roles/cocina/CocinaPanel';
import PanelGerencia from './roles/gerencia/PanelGerencia';
import Login from './pages/Login';
import EmailVerification from './pages/EmailVerification';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// ... otros imports ...

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email/:token" element={<EmailVerification />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Rutas protegidas */}
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