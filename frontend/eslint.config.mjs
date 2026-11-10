import nextVitals from 'eslint-config-next/core-web-vitals';

export default [
  ...nextVitals,
  { ignores: ['.next/**', 'out/**'] },
  {
    rules: {
      'react/no-unescaped-entities': 'off',
      // These effects synchronize state with browser APIs and the 3D renderer.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
];
