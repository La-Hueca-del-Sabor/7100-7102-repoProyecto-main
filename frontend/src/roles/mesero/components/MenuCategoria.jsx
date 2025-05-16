import React from 'react';

const MenuCategoria = ({ onSelectCategoria }) => {
  const categorias = [
    { id: 'menestras', nombre: 'MENESTRAS' },
    { id: 'tortillas', nombre: 'TORTILLAS CON CAUCARA' },
    { id: 'pinchos', nombre: 'PINCHOS' },
    { id: 'seco', nombre: 'SECO DE POLLO' },
    { id: 'bebidas', nombre: 'BEBIDAS' },
    { id: 'porciones', nombre: 'PORCIONES ADICIONALES' }
  ];

  return (
    <div className="card shadow mb-4" style={{ borderRadius: '8px' }}>
      <div className="card-header" style={{ backgroundColor: '#FF8C00', color: 'white', borderRadius: '8px 8px 0 0' }}>
        <h5 className="mb-0" style={{ fontWeight: '600' }}>Categorías</h5>
      </div>
      <div className="card-body p-0">
        <ul className="list-group list-group-flush">
          {categorias.map((categoria) => (
            <li 
              key={categoria.id} 
              className="list-group-item list-group-item-action d-flex align-items-center"
              onClick={() => onSelectCategoria(categoria.id)}
              style={{ cursor: 'pointer', borderRadius: '0', fontWeight: '500', transition: 'background-color 0.2s ease' }}
            >
              <span className="me-2">🟡</span>
              {categoria.nombre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MenuCategoria;
