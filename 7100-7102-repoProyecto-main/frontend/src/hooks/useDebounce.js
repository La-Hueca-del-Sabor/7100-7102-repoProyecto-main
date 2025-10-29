import { useState, useEffect } from 'react';

/**
 * Hook para debounce de valores
 * Útil para búsquedas en tiempo real, filtros, etc.
 * @param {any} value - Valor a hacer debounce
 * @param {number} delay - Tiempo de espera en milisegundos (por defecto: 500ms)
 * @returns {any} - Valor con debounce aplicado
 *
 * @example
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     // Hacer búsqueda con debouncedSearchTerm
 *   }
 * }, [debouncedSearchTerm]);
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Establecer un timer que actualice el valor después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar el timer si el valor cambia antes de que se cumpla el delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;