import React from 'react';
import PropTypes from 'prop-types';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../../atoms/Button';

/**
 * Form component that integrates with React Hook Form and Zod validation
 */
const Form = ({
  defaultValues = {},
  schema = null,
  onSubmit,
  children,
  submitText = 'Submit',
  resetText = null,
  isLoading = false,
  className = '',
  ...props
}) => {
  const methods = useForm({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
    mode: 'onBlur',
  });
  
  const handleSubmit = methods.handleSubmit(onSubmit);
  
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit} className={className} {...props}>
        {children}
        
        <div className="mt-6 flex items-center justify-end gap-4">
          {resetText && (
            <Button
              type="button"
              variant="outline"
              onClick={() => methods.reset()}
              disabled={isLoading}
            >
              {resetText}
            </Button>
          )}
          
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
          >
            {submitText}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

Form.propTypes = {
  defaultValues: PropTypes.object,
  schema: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  submitText: PropTypes.string,
  resetText: PropTypes.string,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
};

export default Form;
