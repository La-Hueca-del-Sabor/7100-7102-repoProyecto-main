import { useEffect } from 'react';

/**
 * Hook para detectar clics fuera de un elemento
 * Útil para cerrar dropdowns, menús contextuales, etc.
 * @param {React.RefObject} ref - Referencia al elemento
 * @param {function} handler - Función a ejecutar al hacer clic fuera
 * @param {boolean} enabled - Si el hook está activo (por defecto: true)
 *
 * @example
 * const dropdownRef = useRef(null);
 * useClickOutside(dropdownRef, () => setIsOpen(false));
 */
const useClickOutside = (ref, handler, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event) => {
      // Si el ref no existe o el clic fue dentro del elemento, no hacer nada
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }

      // Ejecutar el handler
      handler(event);
    };

    // Agregar event listener
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    // Limpiar event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref, handler, enabled]);
};

export default useClickOutside;