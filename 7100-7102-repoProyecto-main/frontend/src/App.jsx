import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Providers
import { AuthProvider } from './context/AuthContext';
import { PedidosProvider } from './context/PedidosContext';

// Rutas
import AppRoutes from './routes/AppRoutes';

// Estilos
import './styles/index.css';

/**
 * Componente principal de la aplicación
 */
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PedidosProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </PedidosProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;