import React from 'react';
import { Checkbox } from '../checkbox';

export default {
  title: 'UI/Checkbox',
  component: Checkbox,
  argTypes: {
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    required: {
      control: 'boolean',
      description: 'Whether the checkbox is required',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onCheckedChange: { action: 'checked changed' },
  },
};

// Template for creating stories
const Template = (args) => <Checkbox {...args} />;

// Default checkbox
export const Default = Template.bind({});
Default.args = {
  checked: false,
};

// Checked checkbox
export const Checked = Template.bind({});
Checked.args = {
  checked: true,
};

// Disabled checkbox
export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
};

// Disabled and checked checkbox
export const DisabledChecked = Template.bind({});
DisabledChecked.args = {
  disabled: true,
  checked: true,
};

// Required checkbox
export const Required = Template.bind({});
Required.args = {
  required: true,
};

// Checkbox with label (using a wrapper component)
export const WithLabel = () => (
  <div className="flex items-center space-x-2">
    <Checkbox id="terms" />
    <label
      htmlFor="terms"
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      Accept terms and conditions
    </label>
  </div>
);

// Checkbox in a form context
export const InFormContext = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-2">
      <Checkbox id="marketing" />
      <label
        htmlFor="marketing"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Receive marketing emails
      </label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="newsletter" defaultChecked />
      <label
        htmlFor="newsletter"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Subscribe to newsletter
      </label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" required />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        I agree to the terms and conditions
      </label>
    </div>
  </div>
);
