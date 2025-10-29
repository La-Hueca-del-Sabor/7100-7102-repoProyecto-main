import { useState, useCallback } from 'react';

/**
 * Hook para gestionar estados booleanos (toggle)
 * Útil para modales, menús, visibilidad de contraseñas, etc.
 * @param {boolean} initialValue - Valor inicial (por defecto: false)
 * @returns {[boolean, function, function, function]} - [value, toggle, setTrue, setFalse]
 *
 * @example
 * const [isOpen, toggleOpen, openModal, closeModal] = useToggle(false);
 */
const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  /**
   * Alterna el valor entre true y false
   */
  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  /**
   * Establece el valor en true
   */
  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  /**
   * Establece el valor en false
   */
  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
};

export default useToggle;