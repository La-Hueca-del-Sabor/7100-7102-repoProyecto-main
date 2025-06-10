import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import MenuProductos from '../../components/MenuProductos';
import html2pdf from 'html2pdf.js';

// Componente del Comprobante
const ComprobanteContenido = ({ orden }) => {
  if (!orden || !orden.platos) {
    return null;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', background: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', marginBottom: '10px' }}>La Hueca del Sabor</h1>
        <h2 style={{ fontSize: '18px', color: '#666' }}>Comprobante de Pago</h2>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <p><strong>Mesa:</strong> {orden.mesa || 'N/A'}</p>
        <p><strong>Cliente:</strong> {orden.cliente_nombre || 'Cliente General'}</p>
        <p><strong>Fecha:</strong> {new Date().toLocaleString()}</p>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f8f9fa' }}>
            <th style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'left' }}>Plato</th>
            <th style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>Cantidad</th>
            <th style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'right' }}>Precio Unit.</th>
            <th style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'right' }}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {orden.platos.map((plato, index) => (
            <tr key={index}>
              <td style={{ padding: '10px', border: '1px solid #dee2e6' }}>{plato.nombre}</td>
              <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'center' }}>{plato.cantidad}</td>
              <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'right' }}>${Number(plato.precio).toFixed(2)}</td>
              <td style={{ padding: '10px', border: '1px solid #dee2e6', textAlign: 'right' }}>
                ${(plato.cantidad * Number(plato.precio)).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ textAlign: 'right', marginTop: '20px', borderTop: '2px solid #dee2e6', paddingTop: '20px' }}>
        <h3 style={{ fontSize: '20px', margin: '0' }}>
          Total: <span style={{ color: '#28a745' }}>${Number(orden.total).toFixed(2)}</span>
        </h3>
      </div>
    </div>
  );
};

const CajaDashboard = () => {
  const navigate = useNavigate();
  const rol = 'caja';
  const [productos, setProductos] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingOrdenes, setLoadingOrdenes] = useState(false);
  const [mostrarMenu, setMostrarMenu] = useState(false);
  const [mostrarTransacciones, setMostrarTransacciones] = useState(false);
  const [mostrarOrdenes, setMostrarOrdenes] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showImprimirModal, setShowImprimirModal] = useState(false);
  const [ordenParaCobrar, setOrdenParaCobrar] = useState(null);
  const [ordenCobrada, setOrdenCobrada] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const componentRef = useRef();

  const handleGenerarPDF = async () => {
    if (!ordenCobrada || !ordenCobrada.platos) {
      console.error('No hay datos válidos para generar PDF');
      return;
    }

    const element = componentRef.current;
    const opt = {
      margin: 1,
      filename: `comprobante-${ordenCobrada.id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
      const pdf = await html2pdf().set(opt).from(element).save();
      setShowPdfPreview(false);
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };

  // Función para obtener las órdenes entregadas y cobradas recientes
  const fetchOrdenes = async () => {
    setLoadingOrdenes(true);
    try {
      const response = await fetch('http://localhost:3004/api/pedidos-detalles');
      if (!response.ok) throw new Error('Error al obtener las órdenes');
      const data = await response.json();
      
      const ahora = new Date();
      const ordenesFiltradas = data.filter(orden => {
        if (orden.estado === 'ENTREGADO') return true;
        
        if (orden.estado === 'COBRADO') {
          const horaCobro = new Date(orden.hora_pedido); // Asumiendo que se actualiza hora_pedido al cobrar
          const minutosTranscurridos = (ahora - horaCobro) / 1000 / 60;
          return minutosTranscurridos <= 4;
        }
        return false;
      });

      const transaccionesFiltradas = data.filter(orden => {
        if (orden.estado === 'COBRADO') {
          const horaCobro = new Date(orden.hora_pedido);
          const minutosTranscurridos = (ahora - horaCobro) / 1000 / 60;
          return minutosTranscurridos > 4;
        }
        return false;
      });

      setOrdenes(ordenesFiltradas);
      setTransacciones(transaccionesFiltradas);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingOrdenes(false);
    }
  };

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://localhost:3003/api/inventory/platos');
        if (!response.ok) throw new Error('Error al obtener el menú');
        const data = await response.json();
        setProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
    fetchOrdenes();

    // Actualizar las órdenes cada 30 segundos
    const interval = setInterval(fetchOrdenes, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    window.location.href = "http://localhost:3000/";
  };

  const handleCobrarOrden = async (idOrden) => {
    try {
      const response = await fetch(`http://localhost:3004/api/pedidos/${idOrden}/cobrar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Error al procesar el pago');
      setShowConfirmModal(false);
      setOrdenCobrada(ordenParaCobrar);
      setOrdenParaCobrar(null);
      setShowImprimirModal(true);
      fetchOrdenes();
    } catch (error) {
      console.error('Error en el cobro:', error);
    }
  };

  const handleConfirmarCobro = (orden) => {
    setOrdenParaCobrar(orden);
    setShowConfirmModal(true);
  };

  const handleImprimir = (ordenId) => {
    console.log('Imprimiendo orden:', ordenId);
    const ordenAImprimir = [...ordenes, ...transacciones].find(orden => orden.id === ordenId);
    if (ordenAImprimir) {
      console.log('Orden encontrada:', ordenAImprimir);
      setOrdenCobrada(ordenAImprimir);
      setShowPdfPreview(true);
    } else {
      console.error('No se encontró la orden con ID:', ordenId);
    }
  };

  const handleCerrarModalImprimir = () => {
    setShowImprimirModal(false);
    setOrdenCobrada(null);
  };

  const handleMostrarMenu = () => {
    setMostrarMenu(true);
    setMostrarTransacciones(false);
    setMostrarOrdenes(false);
  };

  const handleMostrarTransacciones = () => {
    setMostrarTransacciones(true);
    setMostrarMenu(false);
    setMostrarOrdenes(false);
  };

  const handleMostrarOrdenes = () => {
    setMostrarOrdenes(true);
    setMostrarMenu(false);
    setMostrarTransacciones(false);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#fafbfc" }}>
      <aside
        style={{
          width: 220,
          background: "#222",
          color: "#fff",
          padding: "2rem 1rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        <img
          src={require("../../assets/login.jpg")}
          alt="Logo de la empresa"
          style={{
            width: "180px",
            height: "auto",
            marginBottom: "2rem",
          }}
        />
        <h2 style={{ fontSize: "1.3rem", marginBottom: "2rem" }}>Acciones</h2>
        <button
          onClick={handleMostrarOrdenes}
          style={{
            background: mostrarOrdenes ? "#fdbb28" : "#444",
            color: mostrarOrdenes ? "#222" : "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Órdenes por Cobrar
        </button>
        <button
          onClick={handleMostrarMenu}
          style={{
            background: mostrarMenu ? "#fdbb28" : "#444",
            color: mostrarMenu ? "#222" : "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Menú
        </button>
        <button
          onClick={handleMostrarTransacciones}
          style={{
            background: mostrarTransacciones ? "#fdbb28" : "#444",
            color: mostrarTransacciones ? "#222" : "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Ver Transacciones
        </button>
        <button
          onClick={handleLogout}
          style={{
            background: "#ff4d4d",
            color: "white",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "auto",
          }}
        >
          Cerrar Sesión
        </button>
      </aside>

      <main style={{ flex: 1, padding: "2.5rem 3rem" }}>
        <div>
          <h1 style={{ fontWeight: 600, fontSize: "2.2rem", marginBottom: "0.5rem", color: "#222" }}>
            Panel de Caja
          </h1>
          <p style={{
            color: "#555",
            fontSize: "1.1rem",
            marginBottom: "2rem",
            maxWidth: 400,
            textAlign: "center"
          }}>
            Gestiona cobros, revisa transacciones y controla el flujo de caja
          </p>
        </div>

        {mostrarOrdenes && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Órdenes por Cobrar</h2>

            {loadingOrdenes ? (
              <p>Cargando órdenes...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : ordenes.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                color: '#666'
              }}>
                No hay órdenes pendientes de cobro
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '1rem'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '12px' }}>Mesa</th>
                      <th style={{ padding: '12px' }}>Cliente</th>
                      <th style={{ padding: '12px' }}>Total</th>
                      <th style={{ padding: '12px' }}>Estado</th>
                      <th style={{ padding: '12px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.map(orden => (
                      <tr key={orden.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>#{orden.id}</td>
                        <td style={{ padding: '12px' }}>{orden.mesa || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{orden.cliente_nombre}</td>
                        <td style={{ padding: '12px' }}>${orden.total}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            background: orden.estado === 'COBRADO' ? '#4caf50' : '#fdbb28',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.9rem'
                          }}>
                            {orden.estado}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {orden.estado === 'ENTREGADO' ? (
                            <button
                              onClick={() => handleConfirmarCobro(orden)}
                              style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                cursor: 'pointer'
                              }}>
                              Cobrar
                            </button>
                          ) : (
                            <button
                              onClick={() => handleImprimir(orden.id)}
                              style={{
                                background: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '8px 12px',
                                cursor: 'pointer'
                              }}>
                              Imprimir
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {mostrarTransacciones && (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>Historial de Transacciones</h2>
            {loadingOrdenes ? (
              <p>Cargando transacciones...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : transacciones.length === 0 ? (
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                padding: '2rem',
                textAlign: 'center',
                color: '#666'
              }}>
                No hay transacciones para mostrar
              </div>
            ) : (
              <div style={{
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                padding: '1rem'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #eee' }}>
                      <th style={{ padding: '12px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '12px' }}>Mesa</th>
                      <th style={{ padding: '12px' }}>Cliente</th>
                      <th style={{ padding: '12px' }}>Total</th>
                      <th style={{ padding: '12px' }}>Fecha de Cobro</th>
                      <th style={{ padding: '12px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacciones.map(transaccion => (
                      <tr key={transaccion.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '12px' }}>#{transaccion.id}</td>
                        <td style={{ padding: '12px' }}>{transaccion.mesa || 'N/A'}</td>
                        <td style={{ padding: '12px' }}>{transaccion.cliente_nombre}</td>
                        <td style={{ padding: '12px' }}>${transaccion.total}</td>
                        <td style={{ padding: '12px' }}>
                          {new Date(transaccion.hora_pedido).toLocaleString()}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <button
                            onClick={() => handleImprimir(transaccion.id)}
                            style={{
                              background: '#17a2b8',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '8px 12px',
                              cursor: 'pointer'
                            }}>
                            Imprimir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {mostrarMenu && (
          loading ? (
            <p>Cargando menú...</p>
          ) : error ? (
            <p style={{ color: 'red' }}>Error: {error}</p>
          ) : (
            <div style={{ marginTop: "2rem", width: "100%", maxWidth: 800 }}>
              <MenuProductos productos={productos} rol={rol} />
            </div>
          )
        )}
      </main>

      {/* Modal de confirmación de cobro */}
      {showConfirmModal && ordenParaCobrar && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '600px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.5rem' }}>Confirmar Cobro</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '1rem',
                padding: '0.5rem',
                background: '#f8f9fa',
                borderRadius: '4px'
              }}>
                <p><strong>Mesa:</strong> {ordenParaCobrar.mesa}</p>
                <p><strong>Cliente:</strong> {ordenParaCobrar.cliente_nombre}</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  fontSize: '1.1rem', 
                  marginBottom: '1rem',
                  color: '#495057'
                }}>
                  Detalle del Pedido:
                </h3>
                <div style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px'
                }}>
                  <table style={{ 
                    width: '100%', 
                    borderCollapse: 'collapse',
                    background: 'white'
                  }}>
                    <thead style={{ 
                      position: 'sticky', 
                      top: 0, 
                      background: '#f8f9fa',
                      borderBottom: '2px solid #dee2e6'
                    }}>
                      <tr>
                        <th style={{ padding: '0.75rem', textAlign: 'left' }}>Plato</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center' }}>Cantidad</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Precio Unit.</th>
                        <th style={{ padding: '0.75rem', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ordenParaCobrar.platos && ordenParaCobrar.platos.map((plato, index) => (
                        <tr key={index} style={{ 
                          borderBottom: '1px solid #dee2e6'
                        }}>
                          <td style={{ padding: '0.75rem' }}>{plato.nombre}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center' }}>{plato.cantidad}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>${Number(plato.precio).toFixed(2)}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>${(plato.cantidad * Number(plato.precio)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {ordenParaCobrar.notas && (
                <div style={{ 
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: '#f8f9fa',
                  borderRadius: '4px',
                  fontSize: '0.9rem'
                }}>
                  <strong>Notas:</strong> {ordenParaCobrar.notas}
                </div>
              )}

              <div style={{ 
                borderTop: '2px solid #dee2e6',
                paddingTop: '1rem',
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <span style={{ fontSize: '1.2rem' }}>
                  <strong>Total a cobrar:</strong>
                </span>
                <span style={{ 
                  fontSize: '1.5rem',
                  color: '#28a745',
                  fontWeight: 'bold'
                }}>
                  ${Number(ordenParaCobrar.total).toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'flex-end',
              borderTop: '1px solid #dee2e6',
              paddingTop: '1.5rem'
            }}>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setOrdenParaCobrar(null);
                }}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}>
                Cancelar
              </button>
              <button
                onClick={() => handleCobrarOrden(ordenParaCobrar.id)}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                Confirmar Cobro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de impresión */}
      {showImprimirModal && ordenCobrada && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
            textAlign: 'center'
          }}>
            <div style={{
              background: '#28a745',
              color: 'white',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2rem'
            }}>
              ✓
            </div>
            <h2 style={{ 
              marginBottom: '1rem', 
              fontSize: '1.5rem',
              color: '#28a745'
            }}>
              ¡Cobro Exitoso!
            </h2>
            <p style={{ 
              marginBottom: '2rem',
              fontSize: '1.1rem',
              color: '#666'
            }}>
              ¿Desea imprimir el comprobante?
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCerrarModalImprimir}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                Salir
              </button>
              <button
                onClick={() => {
                  handleGenerarPDF();
                  handleCerrarModalImprimir();
                }}
                style={{
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '10px 24px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}>
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de previsualización del PDF */}
      {showPdfPreview && ordenCobrada && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '8px',
            width: '90%',
            maxWidth: '800px',
            boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '1rem'
            }}>
              <h2>Previsualización del Comprobante</h2>
              <button
                onClick={() => setShowPdfPreview(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ maxHeight: 'calc(100vh - 250px)', overflow: 'auto', background: 'white' }}>
              <div ref={componentRef}>
                <ComprobanteContenido orden={ordenCobrada} />
              </div>
            </div>

            <div style={{
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setShowPdfPreview(false)}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Cerrar
              </button>
              <button
                onClick={handleGenerarPDF}
                style={{
                  background: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer'
                }}
              >
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CajaDashboard;
