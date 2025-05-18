
import React, { useState } from 'react';

import logo from '../../../src/assets/login.jpg';

import FormularioPlato from './components/FormularioPlato';
import { addPlato, getUltimosPlatos } from '../../services/inventoryService';

const PanelGerencia = () => {
  const [opcion, setOpcion] = useState('inventario');
  const [mensaje, setMensaje] = useState('');
  const [ultimosPlatos, setUltimosPlatos] = useState([]);

  const cargarUltimosPlatos = async () => {
    try {
      const platos = await getUltimosPlatos();
      setUltimosPlatos(platos);
    } catch (error) {
      setUltimosPlatos([]);
    }
  };

  const handleRegistrarPlato = async (plato) => {
    try {
      await addPlato(plato);
      setMensaje('¡Plato registrado exitosamente!');
      await cargarUltimosPlatos();
    } catch (error) {
      setMensaje('Error al registrar el plato');
    }
    setTimeout(() => setMensaje(''), 3000);
  };

  React.useEffect(() => {
    cargarUltimosPlatos();
  }, []);

  return (
    <div className="container-fluid py-4">
      <h2 className="mb-4">Panel de Gerencia</h2>
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3">
          <div className="card shadow mb-4" style={{ borderRadius: '8px' }}>
            <div className="card-body d-flex flex-column align-items-center">
              <img src={logo} alt="La Hueca del Sabor" style={{ width: '120px', marginBottom: '32px' }} />
              <button
                className="btn btn-outline-primary w-100 mb-2"
                style={{ textAlign: 'left', borderRadius: '8px' }}
                onClick={() => setOpcion('inventario')}
              >
                Inventario
              </button>
              {/* Aquí puedes agregar más opciones en el futuro */}
            </div>
          </div>
        </div>
        {/* Contenido principal */}
        <div className="col-md-9">
          <div className="card shadow" style={{ borderRadius: '8px' }}>
            <div className="card-body">
              {opcion === 'inventario' && (
                <>
                  <h2>Gestión de Inventario</h2>
                  {mensaje && (
                    <div className="alert alert-info">{mensaje}</div>
                  )}
                  <FormularioPlato onRegistrar={handleRegistrarPlato} />
                  {/* Apartado de últimos 3 platos */}
                  <div className="mt-4">
                    <h5>Últimos 3 platos agregados</h5>
                    <ul>
                      {ultimosPlatos.map(plato => (
                        <li key={plato.id}>
                          {plato.nombre} - ${plato.precio} - Stock: {plato.stock_disponible}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PanelGerencia;
