# Shadcn UI Components for Samudra Paket ERP

This directory contains the UI components used throughout the Samudra Paket ERP application. These components are built using the Shadcn UI approach, which provides a set of accessible, customizable, and reusable components that follow the principles of the Atomic Design methodology.

## Component Structure

The components are organized following the Atomic Design methodology:

- **Atoms**: Basic building blocks (Button, Input, Checkbox, etc.)
- **Molecules**: Combinations of atoms (Form fields, Card with content, etc.)
- **Organisms**: Complex UI components (Header, Sidebar, etc.)
- **Templates**: Page layouts
- **Pages**: Specific instances of templates

## Available Components

### Basic Components

- `button.js` - Button component with various styles and sizes
- `input.js` - Input component for text, email, password, etc.
- `checkbox.js` - Checkbox component for boolean selections
- `label.js` - Label component for form fields
- `form.js` - Form components for creating consistent form layouts

### Feedback Components

- `toast.js` - Toast notification components
- `toaster.js` - Toast container for displaying notifications

## Using the Components

### Button Component

```jsx
import { Button } from '@/components/ui/button';

// Default button
<Button>Click me</Button>

// Button variants
<Button variant="default">Default</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
<Button variant="success">Success</Button>
<Button variant="warning">Warning</Button>
<Button variant="danger">Danger</Button>

// Button sizes
<Button size="default">Default</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">Icon</Button>
```

### Input Component

```jsx
import { Input } from '@/components/ui/input';

// Default input
<Input />

// Input types
<Input type="text" placeholder="Text input" />
<Input type="email" placeholder="Email input" />
<Input type="password" placeholder="Password input" />
<Input type="number" placeholder="Number input" />

// Disabled input
<Input disabled placeholder="Disabled input" />
```

### Checkbox Component

```jsx
import { Checkbox } from '@/components/ui/checkbox';

// Default checkbox
<Checkbox />

// Checkbox with label
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <label htmlFor="terms">Accept terms and conditions</label>
</div>

// Disabled checkbox
<Checkbox disabled />
```

### Form Components

```jsx
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form, FormField, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Define your form schema with Zod
const formSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
});

// Create your form with React Hook Form
const form = useForm({
  defaultValues: {
    username: '',
    email: '',
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

// Use the form components
<Form onSubmit={form.handleSubmit(onSubmit)}>
  <FormField>
    <FormLabel>Username</FormLabel>
    <FormControl>
      <Input placeholder="Enter your username" {...form.register('username')} />
    </FormControl>
    {form.formState.errors.username && (
      <FormMessage>{form.formState.errors.username.message}</FormMessage>
    )}
    <FormDescription>This is your public display name.</FormDescription>
  </FormField>
  
  <Button type="submit">Submit</Button>
</Form>
```

### Toast Notifications

```jsx
import { useToast } from '@/hooks/use-toast';

// Get the toast function
const { toast } = useToast();

// Show a toast notification
toast({
  title: 'Success',
  description: 'Your action was completed successfully.',
  variant: 'success',
});

// Show a toast with an action
toast({
  title: 'New Message',
  description: 'You have a new message in your inbox.',
  action: <Button size="sm">View</Button>,
});

// Show an error toast
toast({
  title: 'Error',
  description: 'There was an error processing your request.',
  variant: 'destructive',
});
```

## Storybook Documentation

We use Storybook to document and showcase our UI components. To view the component documentation:

1. Run the Storybook development server:

```bash
npm run storybook
```

2. Open your browser and navigate to `http://localhost:6006`

3. Browse the components in the sidebar to see examples and documentation

## Customizing Components

All components can be customized using Tailwind CSS classes. The components use the `cn` utility function to merge class names:

```jsx
import { cn } from '@/lib/utils/cn';

// Example of customizing a button
<Button className={cn(
  "custom-class",
  isActive && "active-class"
)}>
  Custom Button
</Button>
```

## Theme Customization

The theme is defined in the `tailwind.config.js` file and the CSS variables in `src/styles/shadcn-ui.css`. You can customize the theme by modifying these files.

## Accessibility

All components are designed with accessibility in mind and follow WCAG 2.1 Level AA guidelines. They include proper ARIA attributes and keyboard navigation support.
