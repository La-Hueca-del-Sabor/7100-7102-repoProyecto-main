import React from 'react';
import clsx from 'clsx';

/**
 * Componente Button reutilizable
 * @param {object} props - Propiedades del componente
 * @param {string} props.variant - Variante del botón (primary, secondary, success, danger, outline, ghost)
 * @param {string} props.size - Tamaño del botón (sm, md, lg)
 * @param {boolean} props.isLoading - Estado de carga
 * @param {boolean} props.disabled - Estado deshabilitado
 * @param {boolean} props.fullWidth - Ancho completo
 * @param {React.ReactNode} props.leftIcon - Ícono izquierdo
 * @param {React.ReactNode} props.rightIcon - Ícono derecho
 * @param {string} props.className - Clases CSS adicionales
 * @param {React.ReactNode} props.children - Contenido del botón
 * @param {function} props.onClick - Función al hacer clic
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  children,
  type = 'button',
  onClick,
  ...rest
}) => {
  // Clases base
  const baseClasses = clsx(
    'inline-flex items-center justify-center gap-2',
    'font-medium rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    {
      'w-full': fullWidth,
      'cursor-not-allowed opacity-50': isLoading || disabled,
    }
  );

  // Variantes de color
  const variantClasses = {
    primary: clsx(
      'bg-primary-500 text-white',
      'hover:bg-primary-600 active:bg-primary-700',
      'focus:ring-primary-500',
      'shadow-sm hover:shadow-md'
    ),
    secondary: clsx(
      'bg-secondary-500 text-white',
      'hover:bg-secondary-600 active:bg-secondary-700',
      'focus:ring-secondary-500',
      'shadow-sm hover:shadow-md'
    ),
    success: clsx(
      'bg-success-500 text-white',
      'hover:bg-success-600 active:bg-success-700',
      'focus:ring-success-500',
      'shadow-sm hover:shadow-md'
    ),
    danger: clsx(
      'bg-danger-500 text-white',
      'hover:bg-danger-600 active:bg-danger-700',
      'focus:ring-danger-500',
      'shadow-sm hover:shadow-md'
    ),
    warning: clsx(
      'bg-warning-500 text-secondary-800',
      'hover:bg-warning-600 active:bg-warning-700',
      'focus:ring-warning-500',
      'shadow-sm hover:shadow-md'
    ),
    outline: clsx(
      'border-2 border-primary-500 text-primary-500 bg-transparent',
      'hover:bg-primary-50 active:bg-primary-100',
      'focus:ring-primary-500'
    ),
    ghost: clsx(
      'text-gray-700 bg-transparent',
      'hover:bg-gray-100 active:bg-gray-200',
      'focus:ring-gray-300'
    ),
  };

  // Tamaños
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Clases finales
  const buttonClasses = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...rest}
    >
      {/* Ícono izquierdo */}
      {leftIcon && !isLoading && (
        <span className="flex-shrink-0">{leftIcon}</span>
      )}

      {/* Spinner de carga */}
      {isLoading && (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      {/* Texto del botón */}
      <span>{children}</span>

      {/* Ícono derecho */}
      {rightIcon && !isLoading && (
        <span className="flex-shrink-0">{rightIcon}</span>
      )}
    </button>
  );
};

export default Button;