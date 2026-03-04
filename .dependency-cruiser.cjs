module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'shared-no-modules',
      severity: 'error',
      from: { path: '^src/shared' },
      to: { path: '^src/modules' },
    },
    {
      name: 'shared-no-app',
      severity: 'error',
      from: { path: '^src/shared' },
      to: { path: '^src/app' },
    },
    {
      name: 'shared-no-server',
      severity: 'error',
      from: { path: '^src/shared' },
      to: { path: '^src/server' },
    },
    {
      name: 'modules-no-app',
      severity: 'error',
      from: { path: '^src/modules' },
      to: { path: '^src/app' },
    },
    {
      name: 'server-no-app',
      severity: 'error',
      from: { path: '^src/server' },
      to: { path: '^src/app' },
    },
  ],
  options: {
    includeOnly: '^src',
    doNotFollow: {
      path: 'node_modules',
    },
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs'],
    },
  },
};
