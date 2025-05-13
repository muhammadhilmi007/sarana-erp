import React from 'react';
import { Button } from '../button';

export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success', 'warning', 'danger'],
      description: 'The visual style of the button',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Whether to render as a child component',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    onClick: { action: 'clicked' },
  },
};

// Template for creating stories
const Template = (args) => <Button {...args} />;

// Default button
export const Default = Template.bind({});
Default.args = {
  children: 'Button',
  variant: 'default',
  size: 'default',
};

// Primary button
export const Primary = Template.bind({});
Primary.args = {
  children: 'Primary Button',
  variant: 'default',
  size: 'default',
};

// Secondary button
export const Secondary = Template.bind({});
Secondary.args = {
  children: 'Secondary Button',
  variant: 'secondary',
  size: 'default',
};

// Outline button
export const Outline = Template.bind({});
Outline.args = {
  children: 'Outline Button',
  variant: 'outline',
  size: 'default',
};

// Success button
export const Success = Template.bind({});
Success.args = {
  children: 'Success Button',
  variant: 'success',
  size: 'default',
};

// Warning button
export const Warning = Template.bind({});
Warning.args = {
  children: 'Warning Button',
  variant: 'warning',
  size: 'default',
};

// Danger button
export const Danger = Template.bind({});
Danger.args = {
  children: 'Danger Button',
  variant: 'danger',
  size: 'default',
};

// Small button
export const Small = Template.bind({});
Small.args = {
  children: 'Small Button',
  variant: 'default',
  size: 'sm',
};

// Large button
export const Large = Template.bind({});
Large.args = {
  children: 'Large Button',
  variant: 'default',
  size: 'lg',
};

// Disabled button
export const Disabled = Template.bind({});
Disabled.args = {
  children: 'Disabled Button',
  variant: 'default',
  size: 'default',
  disabled: true,
};

// Icon button
export const Icon = Template.bind({});
Icon.args = {
  children: '👍',
  variant: 'default',
  size: 'icon',
};
