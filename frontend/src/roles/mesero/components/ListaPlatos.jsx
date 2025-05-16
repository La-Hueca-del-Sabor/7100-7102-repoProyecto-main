import React, { useState } from 'react';
import PlatoCard from './PlatoCard';
import PorcionPersonalizada from './PorcionPersonalizada';

const ListaPlatos = ({ categoria }) => {
  // Base de datos de platos según categoría
  const platosData = {
    menestras: [
      {
        id: 1,
        nombre: 'Chuleta Asada',
        descripcion: 'Chuleta Asada + Arroz + Menestra + Patacón',
        precio: 3.50
      },
      {
        id: 2,
        nombre: 'Filete de Pollo',
        descripcion: 'Filete de Pollo + Arroz + Menestra + Patacón',
        precio: 3.00
      },
      {
        id: 3,
        nombre: 'Pincho de Pollo',
        descripcion: 'Pincho de Pollo + Arroz + Menestra + Patacón',
        precio: 3.50
      }
    ],
    tortillas: [
      {
        id: 4,
        nombre: 'Tortilla con Caucara',
        descripcion: 'Tortilla + Huevo Frito + Ensalada + Caucara',
        precio: 2.75
      }
    ],
    pinchos: [
      {
        id: 5,
        nombre: 'Pincho de Pollo con Papa',
        descripcion: 'Pincho de Pollo o Carne + Papa Cocinada + Ensalada',
        precio: 2.50
      },
      {
        id: 6,
        nombre: 'Pincho de Pollo con Tortilla',
        descripcion: 'Pincho de Pollo o Carne + Tortilla de Papa + Ensalada',
        precio: 2.50
      },
      {
        id: 7,
        nombre: 'Seco de Pollo Completo',
        descripcion: 'Seco de Pollo + Arroz + Jugo de Pollo + Papa Cocinada',
        precio: 3.00
      }
    ],
    seco: [
      {
        id: 8,
        nombre: 'Seco de Pollo',
        descripcion: 'Arroz + Jugo de Pollo + Papa Cocinada',
        precio: 2.50
      }
    ],
    bebidas: [
      {
        id: 9,
        nombre: 'Morocho',
        descripcion: 'Bebida tradicional',
        precio: 0.80
      },
      {
        id: 10,
        nombre: 'Avena',
        descripcion: 'Bebida refrescante',
        precio: 0.80
      },
      {
        id: 11,
        nombre: 'Soda Personal',
        descripcion: 'Bebida gaseosa personal',
        precio: 0.50
      },
      {
        id: 12,
        nombre: 'Soda de 2 Litros',
        descripcion: 'Bebida gaseosa familiar',
        precio: 1.00
      },
      {
        id: 13,
        nombre: 'Aguas',
        descripcion: 'Agua mineral o natural',
        precio: 1.00
      },
      {
        id: 14,
        nombre: 'Cerveza',
        descripcion: 'Bebida alcohólica',
        precio: 3.00
      }
    ],
    porciones: [
      {
        id: 101,
        nombre: 'Porción de Tortillas',
        descripcion: 'Porción adicional de tortillas',
        precio: 1.00
      },
      {
        id: 102,
        nombre: 'Porción de Arroz con Menestra',
        descripcion: 'Porción adicional de arroz con menestra',
        precio: 1.50
      },
      {
        id: 103,
        nombre: 'Porción de Arroz',
        descripcion: 'Porción adicional de arroz',
        precio: 1.00
      },
      {
        id: 104,
        nombre: 'Porción de Ensalada',
        descripcion: 'Porción adicional de ensalada',
        precio: 0.50
      },
      {
        id: 105,
        nombre: 'Porción de Menestra',
        descripcion: 'Porción adicional de menestra',
        precio: 1.00
      }
    ]
  };

  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false);

  // Obtener los platos según la categoría seleccionada
  const platos = categoria ? platosData[categoria] : [];

  return (
    <div className="card shadow">
      <div className="card-header" style={{ backgroundColor: '#FF8C00', color: 'white', borderRadius: '8px 8px 0 0' }}>
        <h5 className="mb-0">
          {categoria ? platosData[categoria] ? 
            `${categoria.charAt(0).toUpperCase() + categoria.slice(1)}` : 
            'Seleccione una categoría' : 
            'Seleccione una categoría'}
        </h5>
      </div>
      <div className="card-body">
        {!categoria ? (
          <p className="text-center text-muted">Seleccione una categoría para ver los platos disponibles</p>
        ) : platos.length === 0 ? (
          <p className="text-center text-muted">No hay platos disponibles en esta categoría</p>
        ) : (
          <div className="row">
            {platos.map((plato) => (
              <div key={plato.id} className="col-md-6">
                <PlatoCard plato={plato} />
              </div>
            ))}
            
            {categoria === 'porciones' && (
              <div className="col-md-6">
                <div className="card m-2 p-3 border border-light shadow-sm" style={{ borderRadius: '8px' }}>
                  <h5 style={{ fontWeight: '600' }}>Porción Personalizada</h5>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>Agregue una porción con descripción y precio personalizado</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <button 
                      className="btn btn-sm w-100" 
                      style={{ backgroundColor: '#FF8C00', color: 'white', fontWeight: '500' }} 
                      onClick={() => setMostrarPersonalizado(true)}
                    >
                      Agregar Personalizado
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {mostrarPersonalizado && categoria === 'porciones' && (
          <PorcionPersonalizada onClose={() => setMostrarPersonalizado(false)} />
        )}
      </div>
    </div>
  );
};

export default ListaPlatos;
