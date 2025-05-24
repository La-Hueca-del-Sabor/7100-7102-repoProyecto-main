import React from 'react';
import MenuProductos from '../../components/MenuProductos';

const productosDemo = [
  { id: 1, nombre: 'Hamburguesa', precio: 5000, categoria: 'Comida' },
  { id: 2, nombre: 'Papas Fritas', precio: 2000, categoria: 'Comida' },
  { id: 3, nombre: 'Gaseosa', precio: 1500, categoria: 'Bebida' }
];

const CajaDashboard = () => {
  const rol = 'caja';
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafbfc' }}>
      <h1 style={{ fontWeight: 600, fontSize: '2.2rem', marginBottom: '1.5rem', color: '#222' }}>Panel de Caja</h1>
      <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 400, textAlign: 'center' }}>
        Gestiona cobros, revisa transacciones y controla el flujo de caja de manera eficiente y segura.
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button style={{ padding: '0.8rem 2rem', border: 'none', borderRadius: 8, background: '#fdbb28', color: '#fff', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Cobrar Orden</button>
        <button style={{ padding: '0.8rem 2rem', border: 'none', borderRadius: 8, background: '#222', color: '#fff', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Ver Transacciones</button>
      </div>
      <div style={{ marginTop: '2rem', width: '100%', maxWidth: 500 }}>
        <MenuProductos productos={productosDemo} rol={rol} />
      </div>
    </div>
  );
};

export default CajaDashboard;
