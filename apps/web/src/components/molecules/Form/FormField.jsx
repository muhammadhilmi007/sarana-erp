import React from 'react';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';
import Input from '../../atoms/Input';
import Typography from '../../atoms/Typography';

/**
 * FormField component that integrates with React Hook Form
 */
const FormField = ({
  name,
  label,
  type = 'text',
  placeholder = '',
  helperText = '',
  required = false,
  disabled = false,
  readOnly = false,
  fullWidth = true,
  size = 'md',
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) => {
  const { register, formState: { errors } } = useFormContext();
  const error = errors[name]?.message;
  
  return (
    <div className={`mb-4 ${className}`}>
      <Input
        id={name}
        type={type}
        label={label}
        placeholder={placeholder}
        helperText={helperText}
        error={error}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        fullWidth={fullWidth}
        size={size}
        leftIcon={leftIcon}
        rightIcon={rightIcon}
        {...register(name)}
        {...props}
      />
    </div>
  );
};

FormField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  leftIcon: PropTypes.node,
  rightIcon: PropTypes.node,
  className: PropTypes.string,
};

export default FormField;
