import React from 'react';
import PropTypes from 'prop-types';

/**
 * Typography component for consistent text styling
 */
const Typography = ({
  variant = 'body1',
  component,
  color = 'default',
  align = 'left',
  weight = 'normal',
  className = '',
  children,
  ...props
}) => {
  // Determine the component to render based on variant and component prop
  const getComponent = () => {
    if (component) return component;
    
    switch (variant) {
      case 'h1':
        return 'h1';
      case 'h2':
        return 'h2';
      case 'h3':
        return 'h3';
      case 'h4':
        return 'h4';
      case 'h5':
        return 'h5';
      case 'h6':
        return 'h6';
      case 'subtitle1':
        return 'h6';
      case 'subtitle2':
        return 'h6';
      case 'body1':
        return 'p';
      case 'body2':
        return 'p';
      case 'caption':
        return 'span';
      case 'overline':
        return 'span';
      default:
        return 'p';
    }
  };
  
  // Variant classes
  const variantClasses = {
    h1: 'text-4xl md:text-5xl font-heading',
    h2: 'text-3xl md:text-4xl font-heading',
    h3: 'text-2xl md:text-3xl font-heading',
    h4: 'text-xl md:text-2xl font-heading',
    h5: 'text-lg md:text-xl font-heading',
    h6: 'text-base md:text-lg font-heading',
    subtitle1: 'text-xl font-medium',
    subtitle2: 'text-lg font-medium',
    body1: 'text-base',
    body2: 'text-sm',
    caption: 'text-xs',
    overline: 'text-xs uppercase tracking-wider',
  };
  
  // Color classes
  const colorClasses = {
    default: 'text-gray-900 dark:text-gray-100',
    primary: 'text-primary-500',
    secondary: 'text-secondary-500',
    success: 'text-success-500',
    warning: 'text-warning-500',
    danger: 'text-danger-500',
    info: 'text-blue-500',
    light: 'text-gray-500 dark:text-gray-400',
    dark: 'text-gray-800 dark:text-gray-200',
    white: 'text-white',
  };
  
  // Alignment classes
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
    justify: 'text-justify',
  };
  
  // Font weight classes
  const weightClasses = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    extrabold: 'font-extrabold',
  };
  
  // Combine all classes
  const classes = `
    ${variantClasses[variant] || variantClasses.body1}
    ${colorClasses[color] || colorClasses.default}
    ${alignClasses[align] || alignClasses.left}
    ${weightClasses[weight] || weightClasses.normal}
    ${className}
  `.trim();
  
  const Component = getComponent();
  
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
};

Typography.propTypes = {
  variant: PropTypes.oneOf([
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'subtitle1', 'subtitle2',
    'body1', 'body2',
    'caption', 'overline',
  ]),
  component: PropTypes.elementType,
  color: PropTypes.oneOf([
    'default', 'primary', 'secondary',
    'success', 'warning', 'danger', 'info',
    'light', 'dark', 'white',
  ]),
  align: PropTypes.oneOf(['left', 'center', 'right', 'justify']),
  weight: PropTypes.oneOf(['light', 'normal', 'medium', 'semibold', 'bold', 'extrabold']),
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

export default Typography;
