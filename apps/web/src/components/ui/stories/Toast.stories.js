import React from 'react';
import { Toast, ToastTitle, ToastDescription, ToastAction, ToastClose } from '../toast';
import { Button } from '../button';

export default {
  title: 'UI/Toast',
  component: Toast,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'success', 'warning'],
      description: 'The visual style of the toast',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

// Template for creating stories
const Template = (args) => <Toast {...args} />;

// Default toast
export const Default = Template.bind({});
Default.args = {
  children: (
    <>
      <div className="grid gap-1">
        <ToastTitle>Toast Title</ToastTitle>
        <ToastDescription>This is a default toast notification.</ToastDescription>
      </div>
      <ToastClose />
    </>
  ),
};

// Success toast
export const Success = Template.bind({});
Success.args = {
  variant: 'success',
  children: (
    <>
      <div className="grid gap-1">
        <ToastTitle>Success</ToastTitle>
        <ToastDescription>Your action was completed successfully.</ToastDescription>
      </div>
      <ToastClose />
    </>
  ),
};

// Warning toast
export const Warning = Template.bind({});
Warning.args = {
  variant: 'warning',
  children: (
    <>
      <div className="grid gap-1">
        <ToastTitle>Warning</ToastTitle>
        <ToastDescription>Please review your information before proceeding.</ToastDescription>
      </div>
      <ToastClose />
    </>
  ),
};

// Destructive toast
export const Destructive = Template.bind({});
Destructive.args = {
  variant: 'destructive',
  children: (
    <>
      <div className="grid gap-1">
        <ToastTitle>Error</ToastTitle>
        <ToastDescription>There was an error processing your request.</ToastDescription>
      </div>
      <ToastClose />
    </>
  ),
};

// Toast with action
export const WithAction = Template.bind({});
WithAction.args = {
  children: (
    <>
      <div className="grid gap-1">
        <ToastTitle>New Message</ToastTitle>
        <ToastDescription>You have a new message in your inbox.</ToastDescription>
      </div>
      <ToastAction altText="View message">View</ToastAction>
      <ToastClose />
    </>
  ),
};

// Toast with long content
export const WithLongContent = Template.bind({});
WithLongContent.args = {
  children: (
    <>
      <div className="grid gap-1">
        <ToastTitle>Information Update</ToastTitle>
        <ToastDescription>
          This is a toast with a longer description that might wrap to multiple lines.
          We want to make sure that the toast component handles this case gracefully without
          breaking the layout or making the content difficult to read.
        </ToastDescription>
      </div>
      <ToastClose />
    </>
  ),
};
