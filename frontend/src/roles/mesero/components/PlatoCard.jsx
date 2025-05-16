import React, { useContext } from 'react';
import { PedidoContext } from '../PedidoContext';

const PlatoCard = ({ plato }) => {
  const { agregarPlato } = useContext(PedidoContext);

  return (
    <div className="card m-2 p-3 border border-light shadow-sm" style={{ borderRadius: '8px' }}>
      <h5 style={{ fontWeight: '600' }}>{plato.nombre}</h5>
      <p className="text-muted" style={{ fontSize: '0.9rem' }}>{plato.descripcion}</p>
      <div className="d-flex justify-content-between align-items-center">
        <span className="fw-bold" style={{ fontSize: '1.1rem' }}>${plato.precio}</span>
        <button 
          className="btn btn-sm" 
          style={{ backgroundColor: '#FF8C00', color: 'white', fontWeight: '500' }} 
          onClick={() => agregarPlato(plato)}
        >
          Agregar
        </button>
      </div>
    </div>
  );
};

export default PlatoCard;
