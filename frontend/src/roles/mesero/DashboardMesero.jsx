import React from 'react';

const DashboardMesero = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafbfc' }}>
      <h1 style={{ fontWeight: 600, fontSize: '2.2rem', marginBottom: '1.5rem', color: '#222' }}>Panel del Mesero</h1>
      <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 400, textAlign: 'center' }}>
        Gestiona pedidos, consulta el menú y envía órdenes de manera rápida y sencilla.
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button style={{ padding: '0.8rem 2rem', border: 'none', borderRadius: 8, background: '#fdbb28', color: '#fff', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Tomar Pedido</button>
        <button style={{ padding: '0.8rem 2rem', border: 'none', borderRadius: 8, background: '#222', color: '#fff', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Consultar Menú</button>
        <button style={{ padding: '0.8rem 2rem', border: 'none', borderRadius: 8, background: '#4caf50', color: '#fff', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Órdenes Enviadas</button>
      </div>
    </div>
  );
};

export default DashboardMesero;
