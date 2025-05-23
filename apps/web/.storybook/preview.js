import '../src/styles/globals.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: 'light',
    values: [
      {
        name: 'light',
        value: '#f9fafb',
      },
      {
        name: 'dark',
        value: '#111827',
      },
    ],
  },
  darkMode: {
    current: 'light',
    stylePreview: true,
    darkClass: 'dark',
    lightClass: 'light',
  },
};
