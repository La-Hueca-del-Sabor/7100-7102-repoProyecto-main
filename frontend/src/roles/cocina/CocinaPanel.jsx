
import React from 'react';
const CocinaPanel = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fafbfc' }}>
      <h1 style={{ fontWeight: 600, fontSize: '2.2rem', marginBottom: '1.5rem', color: '#222' }}>Panel de Cocina</h1>
      <p style={{ color: '#555', fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 400, textAlign: 'center' }}>
        Visualiza y gestiona las órdenes en curso de manera eficiente y clara.
      </p>
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button style={{ padding: '0.8rem 2rem', border: 'none', borderRadius: 8, background: '#fdbb28', color: '#fff', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Órdenes Pendientes</button>
        <button style={{ padding: '0.8rem 2rem', border: 'none', borderRadius: 8, background: '#222', color: '#fff', fontWeight: 500, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 2px 8px #0001' }}>Historial</button>
      </div>
    </div>
  );
};
export default CocinaPanel;
