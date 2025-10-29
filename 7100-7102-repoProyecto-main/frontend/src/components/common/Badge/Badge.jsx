import React from 'react';
import clsx from 'clsx';

/**
 * Componente Badge para mostrar estados
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del badge
 * @param {string} props.variant - Variante de color (primary, success, warning, danger, info, secondary)
 * @param {string} props.size - Tamaño (sm, md, lg)
 * @param {boolean} props.dot - Mostrar punto indicador
 * @param {string} props.className - Clases CSS adicionales
 */
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  className = '',
  ...rest
}) => {
  // Variantes de color
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 border-primary-200',
    success: 'bg-success-100 text-success-800 border-success-200',
    warning: 'bg-warning-100 text-warning-800 border-warning-200',
    danger: 'bg-danger-100 text-danger-800 border-danger-200',
    info: 'bg-info-100 text-info-800 border-info-200',
    secondary: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  // Tamaños
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  // Color del dot
  const dotColorClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
    info: 'bg-info-500',
    secondary: 'bg-gray-500',
  };

  // Clases finales
  const badgeClasses = clsx(
    'inline-flex items-center gap-1.5',
    'rounded-full font-medium',
    'border',
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  return (
    <span className={badgeClasses} {...rest}>
      {dot && (
        <span
          className={clsx(
            'w-2 h-2 rounded-full',
            dotColorClasses[variant]
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;