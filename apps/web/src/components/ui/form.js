import * as React from "react";
import { cn } from "../../lib/utils/cn";
import { Label } from "./label";

/**
 * Form component for creating consistent form layouts
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Form content
 */
const Form = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <form
      ref={ref}
      className={cn("space-y-6", className)}
      {...props}
    />
  );
});
Form.displayName = "Form";

/**
 * FormField component for creating form fields with labels and error messages
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} props.name - Field name
 * @param {React.ReactNode} props.children - Field content
 */
const FormField = React.forwardRef(({ className, name, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props} />
  );
});
FormField.displayName = "FormField";

/**
 * FormLabel component for form field labels
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Label content
 */
const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      className={cn("text-sm font-medium", className)}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

/**
 * FormControl component for form field controls
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Control content
 */
const FormControl = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("mt-1", className)} {...props} />
  );
});
FormControl.displayName = "FormControl";

/**
 * FormDescription component for form field descriptions
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Description content
 */
const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

/**
 * FormMessage component for form field error messages
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Error message content
 */
const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {children}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
};
