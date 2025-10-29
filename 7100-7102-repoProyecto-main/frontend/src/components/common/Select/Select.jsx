import React, { forwardRef } from 'react';
import clsx from 'clsx';

/**
 * Componente Select reutilizable
 */
const Select = forwardRef(({
  label,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  placeholder = 'Seleccionar...',
  value,
  onChange,
  onBlur,
  className = '',
  id,
  name,
  ...rest
}, ref) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  const labelClasses = clsx(
    'block text-sm font-medium text-gray-700 mb-1.5',
    {
      'after:content-["*"] after:ml-0.5 after:text-danger-500': required,
    }
  );

  const selectClasses = clsx(
    'w-full px-4 py-2.5 text-base',
    'border rounded-lg',
    'transition-all duration-200',
    'focus:outline-none focus:ring-2',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    {
      'border-gray-300 focus:ring-primary-500 focus:border-transparent': !error,
      'border-danger-500 focus:ring-danger-500 focus:border-transparent': error,
    },
    className
  );

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className={labelClasses}>
          {label}
        </label>
      )}

      <select
        ref={ref}
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={selectClasses}
        aria-invalid={!!error}
        aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
        {...rest}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option, index) => (
          <option key={option.value || index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p
          id={`${selectId}-error`}
          className="mt-1.5 text-sm text-danger-600 flex items-center gap-1"
        >
          {error}
        </p>
      )}

      {helperText && !error && (
        <p
          id={`${selectId}-helper`}
          className="mt-1.5 text-sm text-gray-500"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;