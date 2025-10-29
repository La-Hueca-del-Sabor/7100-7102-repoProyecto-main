import React from 'react';
import clsx from 'clsx';

/**
 * Componente Card principal
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del card
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.hoverable - Si tiene efecto hover
 * @param {function} props.onClick - Función al hacer clic (convierte el card en clickeable)
 */
const Card = ({
  children,
  className = '',
  hoverable = false,
  onClick,
  ...rest
}) => {
  const cardClasses = clsx(
    'bg-white rounded-xl shadow-soft border border-gray-100',
    'transition-all duration-200',
    {
      'hover:shadow-medium cursor-pointer': hoverable || onClick,
      'hover:border-primary-200': hoverable || onClick,
    },
    className
  );

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      className={cardClasses}
      onClick={onClick}
      {...rest}
    >
      {children}
    </Component>
  );
};

/**
 * Componente CardHeader
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del header
 * @param {string} props.title - Título del card
 * @param {React.ReactNode} props.actions - Acciones (botones, iconos)
 * @param {string} props.className - Clases CSS adicionales
 */
const CardHeader = ({
  children,
  title,
  actions,
  className = '',
  ...rest
}) => {
  return (
    <div
      className={clsx(
        'px-6 py-4 border-b border-gray-100',
        'flex items-center justify-between',
        className
      )}
      {...rest}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex items-center gap-2 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
};

/**
 * Componente CardBody
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del body
 * @param {string} props.className - Clases CSS adicionales
 * @param {boolean} props.noPadding - Sin padding
 */
const CardBody = ({
  children,
  className = '',
  noPadding = false,
  ...rest
}) => {
  return (
    <div
      className={clsx(
        { 'p-6': !noPadding },
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

/**
 * Componente CardFooter
 * @param {object} props - Propiedades del componente
 * @param {React.ReactNode} props.children - Contenido del footer
 * @param {string} props.className - Clases CSS adicionales
 */
const CardFooter = ({
  children,
  className = '',
  ...rest
}) => {
  return (
    <div
      className={clsx(
        'px-6 py-4 border-t border-gray-100',
        'bg-gray-50 rounded-b-xl',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

// Exportar componentes
Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;