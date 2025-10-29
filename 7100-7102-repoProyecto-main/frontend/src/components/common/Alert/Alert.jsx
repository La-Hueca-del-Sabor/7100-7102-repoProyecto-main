import React from 'react';
import clsx from 'clsx';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaTimes
} from 'react-icons/fa';

/**
 * Componente Alert para notificaciones y mensajes
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del alert
 * @param {string} props.variant - Variante de color (success, danger, warning, info)
 * @param {string} props.title - Título del alert
 * @param {boolean} props.dismissible - Si se puede cerrar
 * @param {function} props.onClose - Función al cerrar
 * @param {string} props.className - Clases CSS adicionales
 */
const Alert = ({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onClose,
  className = '',
  ...rest
}) => {
  // Variantes de color
  const variantClasses = {
    success: 'bg-success-50 border-success-200 text-success-800',
    danger: 'bg-danger-50 border-danger-200 text-danger-800',
    warning: 'bg-warning-50 border-warning-200 text-warning-800',
    info: 'bg-info-50 border-info-200 text-info-800',
  };

  // Íconos por variante
  const icons = {
    success: <FaCheckCircle className="text-success-500" size={20} />,
    danger: <FaTimesCircle className="text-danger-500" size={20} />,
    warning: <FaExclamationCircle className="text-warning-500" size={20} />,
    info: <FaInfoCircle className="text-info-500" size={20} />,
  };

  // Clases finales
  const alertClasses = clsx(
    'p-4 rounded-lg border',
    'flex items-start gap-3',
    variantClasses[variant],
    className
  );

  return (
    <div className={alertClasses} role="alert" {...rest}>
      {/* Ícono */}
      <div className="flex-shrink-0 mt-0.5">
        {icons[variant]}
      </div>

      {/* Contenido */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="font-semibold mb-1">
            {title}
          </h4>
        )}
        <div className="text-sm">
          {children}
        </div>
      </div>

      {/* Botón de cerrar */}
      {dismissible && (
        <button
          onClick={onClose}
          className={clsx(
            'flex-shrink-0 p-1 rounded',
            'hover:bg-black/5 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            {
              'focus:ring-success-500': variant === 'success',
              'focus:ring-danger-500': variant === 'danger',
              'focus:ring-warning-500': variant === 'warning',
              'focus:ring-info-500': variant === 'info',
            }
          )}
          aria-label="Cerrar alerta"
        >
          <FaTimes size={16} />
        </button>
      )}
    </div>
  );
};

export default Alert;