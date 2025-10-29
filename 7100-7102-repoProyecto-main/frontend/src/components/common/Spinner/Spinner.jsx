import React from 'react';
import clsx from 'clsx';

/**
 * Componente Spinner para estados de carga
 * @param {object} props - Propiedades del componente
 * @param {string} props.size - Tamaño (sm, md, lg, xl)
 * @param {string} props.variant - Variante de color (primary, secondary, white)
 * @param {boolean} props.fullScreen - Spinner en pantalla completa
 * @param {string} props.text - Texto a mostrar debajo del spinner
 * @param {string} props.className - Clases CSS adicionales
 */
const Spinner = ({
  size = 'md',
  variant = 'primary',
  fullScreen = false,
  text = '',
  className = '',
}) => {
  // Tamaños
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-3',
    xl: 'w-16 h-16 border-4',
  };

  // Variantes
  const variantClasses = {
    primary: 'border-gray-200 border-t-primary-500',
    secondary: 'border-gray-200 border-t-secondary-500',
    white: 'border-white/20 border-t-white',
  };

  // Clases del spinner
  const spinnerClasses = clsx(
    'inline-block rounded-full animate-spin',
    sizeClasses[size],
    variantClasses[variant],
    className
  );

  // Si es fullScreen, renderizar con overlay
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <div className={spinnerClasses} />
          {text && (
            <p className="text-gray-600 font-medium animate-pulse">
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Renderizado normal
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={spinnerClasses} />
      {text && (
        <p className="text-sm text-gray-600">
          {text}
        </p>
      )}
    </div>
  );
};

export default Spinner;