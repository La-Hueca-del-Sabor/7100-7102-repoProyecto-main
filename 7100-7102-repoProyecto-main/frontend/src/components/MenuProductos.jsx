import React from "react";

const MenuProductos = ({ productos, rol, onAgregar, onEditar, onEliminar }) => {
  return (
    <div className="menu-productos">
      <h2>Menú de Productos</h2>
      <div className="productos-lista">
        {productos && productos.length > 0 ? (
          productos.map((producto) => (
            <div key={producto.id} className="producto-item">
              <h4>{producto.nombre}</h4>
              <p>Precio: ${producto.precio}</p>
              <p>Categoría: {producto.categoria}</p>
              {rol === "gerente" && (
                <div className="controles-gerente">
                  <button onClick={() => onEditar(producto)}>Editar</button>
                  <button onClick={() => onEliminar(producto.id)}>Eliminar</button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>No hay productos disponibles.</p>
        )}
      </div>
      {rol === "gerente" && (
        <button className="agregar-producto-btn" onClick={onAgregar}>
          Agregar Producto
        </button>
      )}
    </div>
  );
};

export default MenuProductos;