import React, { useState, useContext } from 'react';
import { PedidoContext } from '../PedidoContext';

const PorcionPersonalizada = ({ onClose }) => {
  const { agregarPlato } = useContext(PedidoContext);
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (nombre.trim() === '' || precio === '') {
      alert('Por favor complete todos los campos');
      return;
    }
    
    const precioNumerico = parseFloat(precio);
    if (isNaN(precioNumerico) || precioNumerico <= 0) {
      alert('Por favor ingrese un precio válido');
      return;
    }
    
    // Crear un plato personalizado
    const platoPersonalizado = {
      id: `personalizado-${Date.now()}`, // ID único basado en timestamp
      nombre: `Porción: ${nombre}`,
      descripcion: 'Porción personalizada',
      precio: precioNumerico
    };
    
    // Agregar al pedido
    agregarPlato(platoPersonalizado);
    
    // Limpiar el formulario y cerrar
    setNombre('');
    setPrecio('');
    onClose();
  };

  return (
    <div className="card mt-3 shadow-sm" style={{ borderRadius: '8px' }}>
      <div className="card-header" style={{ backgroundColor: '#FF8C00', color: 'white', borderRadius: '8px 8px 0 0' }}>
        <h5 className="mb-0">Agregar Porción Personalizada</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="nombre" className="form-label">Descripción</label>
            <input 
              type="text" 
              className="form-control" 
              id="nombre" 
              placeholder="Escriba aquí la descripción"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{ borderRadius: '6px' }}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="precio" className="form-label">Precio ($)</label>
            <input 
              type="number" 
              className="form-control" 
              id="precio" 
              placeholder="0.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              step="0.01"
              min="0"
              style={{ borderRadius: '6px' }}
            />
          </div>
          <div className="d-flex justify-content-end">
            <button 
              type="button" 
              className="btn btn-secondary me-2" 
              onClick={onClose}
              style={{ borderRadius: '8px' }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn" 
              style={{ backgroundColor: '#FF8C00', color: 'white', borderRadius: '8px' }}
            >
              Agregar al Pedido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PorcionPersonalizada;