import { useState, useEffect } from 'react';

/**
 * Hook para gestionar valores en localStorage con sincronización
 * @param {string} key - Clave del localStorage
 * @param {any} initialValue - Valor inicial si no existe en localStorage
 * @returns {[any, function, function]} - [valor, setValue, removeValue]
 *
 * @example
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 */
const useLocalStorage = (key, initialValue) => {
  // Estado para almacenar el valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Obtener del localStorage
      const item = window.localStorage.getItem(key);

      // Parsear JSON o devolver initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error al leer localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Actualiza el valor en localStorage y en el estado
   * @param {any} value - Nuevo valor (puede ser una función)
   */
  const setValue = (value) => {
    try {
      // Permitir que value sea una función (como useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Guardar en estado
      setStoredValue(valueToStore);

      // Guardar en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));

      // Disparar evento personalizado para sincronizar entre pestañas
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      console.error(`Error al guardar en localStorage key "${key}":`, error);
    }
  };

  /**
   * Elimina el valor del localStorage
   */
  const removeValue = () => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      console.error(`Error al eliminar localStorage key "${key}":`, error);
    }
  };

  // Sincronizar entre pestañas/ventanas
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const item = window.localStorage.getItem(key);
        setStoredValue(item ? JSON.parse(item) : initialValue);
      } catch (error) {
        console.error(`Error al sincronizar localStorage key "${key}":`, error);
      }
    };

    // Escuchar cambios en localStorage
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;