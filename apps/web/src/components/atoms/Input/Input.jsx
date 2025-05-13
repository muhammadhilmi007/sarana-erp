import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Input component with different variants and sizes
 */
const Input = forwardRef(({
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder = '',
  label = '',
  error = '',
  helperText = '',
  disabled = false,
  readOnly = false,
  required = false,
  fullWidth = true,
  size = 'md',
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}, ref) => {
  // Base classes
  const baseClasses = 'block rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200';
  
  // Size classes
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2.5',
  };
  
  // Error classes
  const errorClasses = error ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500' : '';
  
  // Width classes
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Icon classes
  const iconLeftClasses = leftIcon ? 'pl-10' : '';
  const iconRightClasses = rightIcon ? 'pr-10' : '';
  
  // Combine all classes
  const inputClasses = `
    ${baseClasses}
    ${sizeClasses[size] || sizeClasses.md}
    ${errorClasses}
    ${widthClasses}
    ${iconLeftClasses}
    ${iconRightClasses}
    ${className}
  `.trim();
  
  return (
    <div className={`${fullWidth ? 'w-full' : ''}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="ml-1 text-danger-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-danger-500" role="alert">
          {error}
        </p>
      )}
      
      {!error && helperText && (
        <p id={`${id}-helper`} className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
};

export default Input;
