import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

/**
 * Componente Input reutilizable
 * @param {object} props - Propiedades del componente
 * @param {string} props.label - Etiqueta del input
 * @param {string} props.type - Tipo de input (text, email, password, number, tel, etc.)
 * @param {string} props.error - Mensaje de error
 * @param {boolean} props.success - Estado de éxito
 * @param {string} props.helperText - Texto de ayuda
 * @param {boolean} props.required - Campo requerido
 * @param {boolean} props.disabled - Campo deshabilitado
 * @param {React.ReactNode} props.leftIcon - Ícono izquierdo
 * @param {React.ReactNode} props.rightIcon - Ícono derecho
 * @param {string} props.className - Clases CSS adicionales
 * @param {string} props.placeholder - Placeholder
 * @param {string} props.value - Valor del input
 * @param {function} props.onChange - Función onChange
 */
const Input = forwardRef(({
  label,
  type = 'text',
  error,
  success = false,
  helperText,
  required = false,
  disabled = false,
  leftIcon,
  rightIcon,
  className = '',
  id,
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  ...rest
}, ref) => {
  // Generar ID si no se proporciona
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  // Clases del contenedor
  const containerClasses = clsx('w-full', className);

  // Clases del label
  const labelClasses = clsx(
    'block text-sm font-medium text-gray-700 mb-1.5',
    {
      'after:content-["*"] after:ml-0.5 after:text-danger-500': required,
    }
  );

  // Clases del input
  const inputClasses = clsx(
    'w-full px-4 py-2.5 text-base',
    'border rounded-lg',
    'transition-all duration-200',
    'placeholder:text-gray-400',
    'focus:outline-none focus:ring-2',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    {
      // Estado normal
      'border-gray-300 focus:ring-primary-500 focus:border-transparent': !error && !success,

      // Estado de error
      'border-danger-500 focus:ring-danger-500 focus:border-transparent': error,

      // Estado de éxito
      'border-success-500 focus:ring-success-500 focus:border-transparent': success,

      // Con ícono izquierdo
      'pl-11': leftIcon,

      // Con ícono derecho (o indicador de error/éxito)
      'pr-11': rightIcon || error || success,
    }
  );

  // Clases del wrapper del input (para íconos)
  const inputWrapperClasses = 'relative flex items-center';

  // Clases de los íconos
  const iconClasses = 'absolute text-gray-400 pointer-events-none';
  const leftIconClasses = clsx(iconClasses, 'left-3');
  const rightIconClasses = clsx(iconClasses, 'right-3');

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label htmlFor={inputId} className={labelClasses}>
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className={inputWrapperClasses}>
        {/* Ícono izquierdo */}
        {leftIcon && (
          <div className={leftIconClasses}>
            {leftIcon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          className={inputClasses}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          {...rest}
        />

        {/* Ícono derecho o indicador de estado */}
        {(rightIcon || error || success) && (
          <div className={rightIconClasses}>
            {error ? (
              <FaExclamationCircle className="text-danger-500" size={20} />
            ) : success ? (
              <FaCheckCircle className="text-success-500" size={20} />
            ) : (
              rightIcon
            )}
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-sm text-danger-600 flex items-center gap-1"
        >
          {error}
        </p>
      )}

      {/* Texto de ayuda */}
      {helperText && !error && (
        <p
          id={`${inputId}-helper`}
          className="mt-1.5 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;