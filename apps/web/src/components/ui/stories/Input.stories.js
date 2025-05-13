import React from 'react';
import { Input } from '../input';

export default {
  title: 'UI/Input',
  component: Input,
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'url', 'search', 'date'],
      description: 'The type of the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text for the input',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the input is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the input is required',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onChange: { action: 'changed' },
  },
};

// Template for creating stories
const Template = (args) => <Input {...args} />;

// Default input
export const Default = Template.bind({});
Default.args = {
  type: 'text',
  placeholder: 'Enter text...',
};

// Email input
export const Email = Template.bind({});
Email.args = {
  type: 'email',
  placeholder: 'Enter email address...',
};

// Password input
export const Password = Template.bind({});
Password.args = {
  type: 'password',
  placeholder: 'Enter password...',
};

// Number input
export const Number = Template.bind({});
Number.args = {
  type: 'number',
  placeholder: 'Enter number...',
};

// Search input
export const Search = Template.bind({});
Search.args = {
  type: 'search',
  placeholder: 'Search...',
};

// Date input
export const Date = Template.bind({});
Date.args = {
  type: 'date',
};

// Disabled input
export const Disabled = Template.bind({});
Disabled.args = {
  type: 'text',
  placeholder: 'Disabled input',
  disabled: true,
};

// Required input
export const Required = Template.bind({});
Required.args = {
  type: 'text',
  placeholder: 'Required input',
  required: true,
};
