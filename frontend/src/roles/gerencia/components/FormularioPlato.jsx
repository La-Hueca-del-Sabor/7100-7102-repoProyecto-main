import React, { useState } from 'react';

const FormularioPlato = ({ onRegistrar }) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [stock, setStock] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nombre || !precio || !stock) {
      alert('Por favor, complete todos los campos.');
      return;
    }
    if (parseFloat(precio) <= 0 || parseInt(stock) < 0) {
      alert('Ingrese valores válidos para precio y stock.');
      return;
    }
    onRegistrar({
      nombre,
      precio: parseFloat(precio),
      stock: parseInt(stock)
    });
    setNombre('');
    setPrecio('');
    setStock('');
  };

  return (
    <form className="mt-4" onSubmit={handleSubmit}>
      <div className="mb-3">
        <label className="form-label">Nombre del Plato</label>
        <input
          type="text"
          className="form-control"
          placeholder="Ej: Arroz con pollo"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Precio ($)</label>
        <input
          type="number"
          className="form-control"
          placeholder="Ej: 5.50"
          min="0"
          step="0.01"
          value={precio}
          onChange={e => setPrecio(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Stock Inicial</label>
        <input
          type="number"
          className="form-control"
          placeholder="Ej: 10"
          min="0"
          value={stock}
          onChange={e => setStock(e.target.value)}
          required
        />
      </div>
      <button type="submit" className="btn btn-primary">
        Registrar Plato
      </button>
    </form>
  );
};

export default FormularioPlato;