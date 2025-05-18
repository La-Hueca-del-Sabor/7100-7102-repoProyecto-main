const API_URL = "http://localhost:3002";

export async function addPlato(plato) {
  const response = await fetch(`${API_URL}/api/platos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nombre: plato.nombre,
      precio: plato.precio,
      stock_disponible: plato.stock
    })
  });
  if (!response.ok) {
    throw new Error("Error al registrar el plato");
  }
  return response.json();
}

export async function getUltimosPlatos() {
  const response = await fetch(`${API_URL}/db-inventory`);
  if (!response.ok) {
    throw new Error("Error al obtener los platos");
  }
  const data = await response.json();
  // Devuelve los últimos 3 platos (asumiendo que vienen ordenados por id DESC)
  return data.data.slice(-3).reverse();
}