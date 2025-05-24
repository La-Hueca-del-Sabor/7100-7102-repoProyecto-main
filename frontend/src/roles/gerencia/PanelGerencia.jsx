import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const PanelGerencia = () => {
  // Navegación
  const navigate = useNavigate();

  // Estados para formulario de agregar plato
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  // Estados para edición de platos
  const [editingPlato, setEditingPlato] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editPrecio, setEditPrecio] = useState("");
  const [editStock, setEditStock] = useState("");

  // Estados para eliminación de platos
  const [deletingPlato, setDeletingPlato] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Estado para confirmación de cerrar sesión
  const [showLogoutModal, setShowLogoutModal] = useState(false);

// Estados principales del componente
const [username, setUsername] = useState('');
const [platosRecientes, setPlatosRecientes] = useState([]);
const [platosInventario, setPlatosInventario] = useState([]);

  // Efecto para cargar datos iniciales
  useEffect(() => {
    fetch("http://localhost:3003/api/inventory/platos")
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta");
        return res.json();
      })
      .then((data) => {
        const sortedData = data.sort(
          (a, b) => new Date(b.actualizado_en) - new Date(a.actualizado_en)
        );
        setPlatosRecientes(sortedData.slice(0, 3));
        setPlatosInventario(sortedData);
      })
      .catch((error) => {
        console.error("Error fetching platos:", error);
        setPlatosRecientes([]);
        setPlatosInventario([]);
      });
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData && userData.nombre) {
      setUsername(userData.nombre);
    }
  }, [mensaje]);

  // Manejo del formulario para agregar plato
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    setError("");
    if (!nombre || !precio || !stock) {
      setError("Todos los campos son obligatorios");
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:3003/api/inventory/platos",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre,
            precio: parseFloat(precio),
            stock_disponible: parseInt(stock, 10),
          }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        setMensaje("Plato agregado correctamente");
        setPlatosInventario((prev) => [data, ...prev]);
        setPlatosRecientes((prev) => {
          const newList = [data, ...prev];
          return newList.slice(0, 3);
        });
        setNombre("");
        setPrecio("");
        setStock("");
      } else {
        setError(data.error || "Error al agregar plato");
      }
    } catch (err) {
      setError("No se pudo conectar con el servicio de inventario");
    }
  };

  // Manejo de edición de platos
  const handleEdit = (plato) => {
    setEditingPlato(plato);
    setEditNombre(plato.nombre);
    setEditPrecio(plato.precio);
    setEditStock(plato.stock_disponible);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(
        `http://localhost:3003/api/inventory/platos/${editingPlato.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: editNombre,
            precio: parseFloat(editPrecio),
            stock_disponible: parseInt(editStock, 10),
          }),
        }
      );

      if (response.ok) {
        const updatedPlato = await response.json();
        setPlatosInventario((prev) =>
          prev.map((p) => (p.id === updatedPlato.id ? updatedPlato : p))
        );
        setPlatosRecientes((prev) =>
          [updatedPlato, ...prev.filter((p) => p.id !== updatedPlato.id)].slice(
            0,
            3
          )
        );
        setShowEditModal(false);
        setMensaje("Plato actualizado correctamente");
      } else {
        setError("Error al actualizar el plato");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
  };

  // Manejo de eliminación de platos
  const handleDelete = async () => {
    try {
      const response = await fetch(
        `http://localhost:3003/api/inventory/platos/${deletingPlato.id}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        setPlatosInventario((prev) =>
          prev.filter((p) => p.id !== deletingPlato.id)
        );
        setPlatosRecientes((prev) =>
          prev.filter((p) => p.id !== deletingPlato.id)
        );
        setMensaje("Plato eliminado correctamente");
      } else {
        setError("Error al eliminar el plato");
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    }
    setShowDeleteModal(false);
    setDeletingPlato(null);
  };

  // Manejo de logout
  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    window.location.href = "http://localhost:3000/";
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
          style={{
            background: "#fdbb28",
            color: "#222",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Inventario
        </button>
        <button
          style={{
            background: "#444",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Ver Reportes
        </button>
        <button
          style={{
            background: "#444",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "0.7rem 1rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Gestionar Usuarios
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
          <h1
            style={{
              fontWeight: 600,
              fontSize: "2.2rem",
              marginBottom: "0.5rem",
              color: "#222",
            }}
          >
            Panel de Gerencia
          </h1>
          <h1
            style={{
              marginBottom: "2rem",
              padding: "1rem", 
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#808080" // Changed to gray color
            }}
          >
            ¡Bienvenido {username}!
          </h1>
        </div>
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>
            Agregar Plato al Inventario
          </h2>
          <form
            onSubmit={handleSubmit}
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <input
              type="text"
              placeholder="Nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: 4,
                border: "1px solid #ccc",
              }}
            />
            <input
              type="number"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: 4,
                border: "1px solid #ccc",
                width: 100,
              }}
            />
            <input
              type="number"
              placeholder="Stock"
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: 4,
                border: "1px solid #ccc",
                width: 80,
              }}
            />
            <button
              type="submit"
              style={{
                background: "#fdbb28",
                color: "#222",
                border: "none",
                borderRadius: 6,
                padding: "0.6rem 1.2rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Agregar
            </button>
          </form>
          {mensaje && (
            <div style={{ color: "green", marginBottom: 10 }}>{mensaje}</div>
          )}
          {error && (
            <div style={{ color: "red", marginBottom: 10 }}>{error}</div>
          )}
        </section>
        <section>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <h2 style={{ fontSize: "1.2rem", margin: 0 }}>
              Últimos 3 platos agregados
            </h2>
            <span
              style={{
                background: "#fdbb28",
                color: "#222",
                padding: "0.25rem 0.5rem",
                borderRadius: "4px",
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              NOVEDADES
            </span>
          </div>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#fdbb28", color: "#222" }}>
                <th style={{ padding: "0.7rem" }}>Nombre</th>
                <th style={{ padding: "0.7rem" }}>Precio</th>
                <th style={{ padding: "0.7rem" }}>Stock</th>
                <th style={{ padding: "0.7rem" }}>Actualizado</th>
              </tr>
            </thead>
            <tbody>
              {platosRecientes.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    No hay platos recientes
                  </td>
                </tr>
              )}
              {platosRecientes.map((plato) => (
                <tr key={plato.id}>
                  <td
                    style={{
                      padding: "0.6rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {plato.nombre}
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        background: "#222",
                        color: "#fff",
                        padding: "0.1rem 0.3rem",
                        borderRadius: "4px",
                        fontSize: "0.75rem",
                      }}
                    >
                      NUEVO
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    ${plato.precio}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {plato.stock_disponible}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {plato.actualizado_en
                      ? new Date(plato.actualizado_en).toLocaleString()
                      : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
            Platos en Inventario
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "#fff",
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <thead>
              <tr style={{ background: "#fdbb28", color: "#222" }}>
                <th style={{ padding: "0.7rem" }}>Nombre</th>
                <th style={{ padding: "0.7rem" }}>Precio</th>
                <th style={{ padding: "0.7rem" }}>Stock</th>
                <th style={{ padding: "0.7rem" }}>Actualizado</th>
                <th style={{ padding: "0.7rem" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {platosInventario.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ textAlign: "center", padding: "1rem" }}
                  >
                    No hay platos registrados.
                  </td>
                </tr>
              )}
              {platosInventario.map((plato) => (
                <tr key={plato.id}>
                  <td
                    style={{
                      padding: "0.6rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {plato.nombre}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    ${plato.precio}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {plato.stock_disponible}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {plato.actualizado_en
                      ? new Date(plato.actualizado_en).toLocaleString()
                      : ""}
                  </td>
                  <td
                    style={{
                      padding: "0.6rem",
                      borderBottom: "1px solid #eee",
                      textAlign: "center",
                    }}
                  >
                    <button
                      onClick={() => handleEdit(plato)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "5px",
                        borderRadius: "4px",
                        marginRight: "8px",
                      }}
                      title="Editar"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#222"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => {
                        setDeletingPlato(plato);
                        setShowDeleteModal(true);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "5px",
                        borderRadius: "4px",
                      }}
                      title="Eliminar"
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#d32f2f"
                      >
                        <path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z" />
                        <line x1="10" y1="11" x2="10" y2="17" />
                        <line x1="14" y1="11" x2="14" y2="17" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Modal de edición */}
        {showEditModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "2rem",
                borderRadius: 8,
                minWidth: 320,
                boxShadow: "0 2px 16px #0002",
              }}
            >
              <h3>Editar Plato</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <input
                  type="text"
                  value={editNombre}
                  onChange={(e) => setEditNombre(e.target.value)}
                  placeholder="Nombre"
                  style={{
                    padding: "0.5rem",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                />
                <input
                  type="number"
                  value={editPrecio}
                  onChange={(e) => setEditPrecio(e.target.value)}
                  placeholder="Precio"
                  style={{
                    padding: "0.5rem",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                />
                <input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  placeholder="Stock"
                  style={{
                    padding: "0.5rem",
                    borderRadius: 4,
                    border: "1px solid #ccc",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => setShowEditModal(false)}
                    style={{
                      background: "#eee",
                      border: "none",
                      borderRadius: 4,
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    style={{
                      background: "#fdbb28",
                      border: "none",
                      borderRadius: 4,
                      padding: "0.5rem 1rem",
                      cursor: "pointer",
                      color: "#222",
                      fontWeight: 600,
                    }}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "2rem",
                borderRadius: 8,
                minWidth: 320,
                boxShadow: "0 2px 16px #0002",
              }}
            >
              <h3>¿Eliminar plato?</h3>
              <p>
                ¿Estás seguro que deseas eliminar <b>{deletingPlato?.nombre}</b>{" "}
                del inventario?
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingPlato(null);
                  }}
                  style={{
                    background: "#eee",
                    border: "none",
                    borderRadius: 4,
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    background: "#d32f2f",
                    border: "none",
                    borderRadius: 4,
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de cerrar sesión */}
        {showLogoutModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                background: "#fff",
                padding: "2rem",
                borderRadius: 8,
                minWidth: 320,
                boxShadow: "0 2px 16px #0002",
              }}
            >
              <h3>¿Cerrar sesión?</h3>
              <p>¿Estás seguro que deseas cerrar la sesión?</p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => setShowLogoutModal(false)}
                  style={{
                    background: "#eee",
                    border: "none",
                    borderRadius: 4,
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmLogout}
                  style={{
                    background: "#d32f2f",
                    border: "none",
                    borderRadius: 4,
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    color: "#fff",
                    fontWeight: 600,
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PanelGerencia;
