import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: [
    '.storybook/**/*',
    'tests/**/*.ts',
    'lighthouserc.js',
  ],
  // Temporary: keep reference-only files out of Knip until feature modules are fully restored.
  // Remove these entries once development resumes on these modules.
  ignoreFiles: [
    'src/modules/brands/components/index.ts',
    'src/modules/brands/index.ts',
    'src/modules/common/constants/index.ts',
    'src/modules/common/dto/index.ts',
    'src/modules/common/enums/index.ts',
    'src/modules/common/helpers/index.ts',
    'src/modules/common/hooks/index.ts',
    'src/modules/common/mappers/index.ts',
    'src/modules/common/services/index.ts',
    'src/modules/common/types/index.ts',
    'src/modules/common/validations/index.ts',
    'src/shared/hooks/use-feature-flag.ts',
    'src/shared/lib/feature-flags.ts',
    'src/shared/lib/http/client-fetcher.ts',
    'src/shared/lib/http/fetcher.ts',
    'src/shared/lib/http/server-fetcher.ts',
  ],
  ignoreDependencies: [
    '@commitlint/types',
    '@commitlint/prompt-cli',
    'cheerio',
    'conventional-changelog-conventionalcommits',
    'vite',
    '@faker-js/faker',
    'npm-run-all',
    'pino',
    'redis',
    'vitest-browser-react',
  ],
  // Temporary: allow setup-phase exports/dependencies that are intentionally kept for reference.
  // Remove these ignores once they become active in runtime code.
  ignoreIssues: {
    'src/shared/config/env.ts': ['exports'],
    'src/shared/lib/api/http-client.ts': ['exports'],
    'src/shared/lib/monitoring.ts': ['exports'],
    'src/server/auth/session.ts': ['exports'],
    'src/shared/lib/react-query/global-mutation-error.ts': ['exports'],
  },
  ignoreBinaries: [
    'production',
    'dotenv',
    'checkly',
    'lhci',
  ],
  ignoreExportsUsedInFile: true,
  compilers: {
    css: (text: string) => [...text.matchAll(/(?<=@)import[^;]+/g)].join('\n'),
  },
};

export default config;
