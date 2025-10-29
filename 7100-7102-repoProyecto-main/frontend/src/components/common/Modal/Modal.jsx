import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import { FaTimes } from 'react-icons/fa';

/**
 * Componente Modal
 * @param {object} props - Propiedades del componente
 * @param {boolean} props.isOpen - Estado de apertura del modal
 * @param {function} props.onClose - Función para cerrar el modal
 * @param {string} props.title - Título del modal
 * @param {React.ReactNode} props.children - Contenido del modal
 * @param {React.ReactNode} props.footer - Footer del modal
 * @param {string} props.size - Tamaño del modal (sm, md, lg, xl, full)
 * @param {boolean} props.closeOnBackdropClick - Cerrar al hacer clic fuera
 * @param {boolean} props.showCloseButton - Mostrar botón de cerrar
 * @param {string} props.className - Clases CSS adicionales
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdropClick = true,
  showCloseButton = true,
  className = '',
}) => {
  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Cerrar con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Clases del backdrop
  const backdropClasses = clsx(
    'fixed inset-0 z-50',
    'bg-black/50 backdrop-blur-sm',
    'flex items-center justify-center p-4',
    'animate-fade-in'
  );

  // Tamaños del modal
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    full: 'max-w-full mx-4',
  };

  // Clases del contenedor del modal
  const modalClasses = clsx(
    'bg-white rounded-2xl shadow-hard',
    'w-full',
    sizeClasses[size],
    'max-h-[90vh] overflow-hidden',
    'flex flex-col',
    'animate-scale-in',
    className
  );

  // Manejar clic en el backdrop
  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // Renderizar el modal usando un portal
  return createPortal(
    <div
      className={backdropClasses}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={modalClasses}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-gray-900"
            >
              {title}
            </h2>

            {showCloseButton && (
              <button
                onClick={onClose}
                className={clsx(
                  'p-2 rounded-lg',
                  'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
                  'transition-colors duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-gray-300'
                )}
                aria-label="Cerrar modal"
              >
                <FaTimes size={20} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;