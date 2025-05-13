import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormLabel, FormControl, FormDescription, FormMessage } from '../form';
import { Input } from '../input';
import { Button } from '../button';
import { Checkbox } from '../checkbox';

export default {
  title: 'UI/Form',
  component: Form,
  parameters: {
    docs: {
      description: {
        component: 'Form components for creating consistent form layouts with validation support using React Hook Form and Zod.',
      },
    },
  },
};

// Simple form example
export const SimpleForm = () => {
  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <Form className="space-y-6 w-full max-w-md" onSubmit={form.handleSubmit(onSubmit)}>
      <FormField className="space-y-2">
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input placeholder="Enter your username" {...form.register('username')} />
        </FormControl>
        <FormDescription>This is your public display name.</FormDescription>
      </FormField>

      <FormField className="space-y-2">
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="Enter your email" {...form.register('email')} />
        </FormControl>
      </FormField>

      <Button type="submit">Submit</Button>
    </Form>
  );
};

// Form with validation example
export const FormWithValidation = () => {
  const formSchema = z.object({
    username: z.string().min(2, 'Username must be at least 2 characters.').max(50),
    email: z.string().email('Please enter a valid email address.'),
    password: z.string()
      .min(8, 'Password must be at least 8 characters.')
      .refine(password => /[A-Z]/.test(password), { message: 'Password must contain at least one uppercase letter.' })
      .refine(password => /[a-z]/.test(password), { message: 'Password must contain at least one lowercase letter.' })
      .refine(password => /[0-9]/.test(password), { message: 'Password must contain at least one number.' })
      .refine(password => /[^A-Za-z0-9]/.test(password), { message: 'Password must contain at least one special character.' }),
    agreeToTerms: z.boolean().refine(val => val === true, { message: 'You must agree to the terms and conditions.' }),
  });

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      agreeToTerms: false,
    },
    resolver: async (data) => {
      try {
        const validatedData = formSchema.parse(data);
        return { values: validatedData, errors: {} };
      } catch (error) {
        const errors = {};
        if (error instanceof z.ZodError) {
          error.errors.forEach((err) => {
            const path = err.path.join('.');
            errors[path] = { message: err.message, type: 'validation' };
          });
        }
        return { values: {}, errors };
      }
    },
  });

  const onSubmit = (data) => {
    console.log(data);
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <Form className="space-y-6 w-full max-w-md" onSubmit={form.handleSubmit(onSubmit)}>
      <FormField className="space-y-2">
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input placeholder="Enter your username" {...form.register('username')} />
        </FormControl>
        {form.formState.errors.username && (
          <FormMessage>{form.formState.errors.username.message}</FormMessage>
        )}
      </FormField>

      <FormField className="space-y-2">
        <FormLabel>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="Enter your email" {...form.register('email')} />
        </FormControl>
        {form.formState.errors.email && (
          <FormMessage>{form.formState.errors.email.message}</FormMessage>
        )}
      </FormField>

      <FormField className="space-y-2">
        <FormLabel>Password</FormLabel>
        <FormControl>
          <Input type="password" placeholder="Enter your password" {...form.register('password')} />
        </FormControl>
        {form.formState.errors.password && (
          <FormMessage>{form.formState.errors.password.message}</FormMessage>
        )}
        <FormDescription>
          Password must be at least 8 characters and include uppercase, lowercase, number, and special character.
        </FormDescription>
      </FormField>

      <FormField className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="terms" {...form.register('agreeToTerms')} />
          <FormLabel htmlFor="terms" className="text-sm font-medium leading-none">
            I agree to the terms and conditions
          </FormLabel>
        </div>
        {form.formState.errors.agreeToTerms && (
          <FormMessage>{form.formState.errors.agreeToTerms.message}</FormMessage>
        )}
      </FormField>

      <Button type="submit">Submit</Button>
    </Form>
  );
};
