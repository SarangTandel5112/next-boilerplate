# Next.js Enterprise Boilerplate

## 1. Project Overview
This repository is a production-grade Next.js 16 App Router boilerplate for admin/SaaS workloads.

Core qualities:
- Strict layering and import boundaries
- Server-authenticated admin area with RBAC
- Structured logging and request tracing
- Standardized API error handling
- CSRF protection and login rate limiting
- Dockerized deployment with standalone output
- CI-enforced quality and architecture checks

## 2. Architecture Diagram (Tree)
```text
src/
├── app/                          # App Router entrypoints, route groups, API routes
│   ├── (admin)/                  # Protected admin routes
│   ├── (auth)/                   # Authentication routes
│   └── api/                      # Route handlers
├── modules/                      # Feature modules (products, brands, categories, auth, admin)
│   ├── <domain>/
│   │   ├── domain/               # Domain types/contracts
│   │   ├── application/          # Use-cases (business orchestration)
│   │   ├── infrastructure/       # Repository implementations
│   │   ├── hooks/                # Feature hooks
│   │   └── components/           # Feature UI
├── shared/                       # Cross-domain, dependency-safe primitives
│   ├── config/                   # Env/config/constants
│   ├── lib/                      # Utilities and shared clients
│   ├── hooks/                    # Reusable hooks only
│   ├── types/                    # Global shared declarations/types
│   └── ui/                       # Truly cross-domain UI primitives
└── server/                       # Server-only platform concerns
    ├── auth/                     # Session + RBAC
    ├── errors/                   # AppError + wrapper
    ├── logging/                  # Pino structured logger
    ├── security/                 # CSRF + rate limit
    └── api/                      # Reserved for server API helpers
```

## 3. Folder Responsibility Breakdown
- `app`: Routing, segment-level loading/error UX, page composition.
- `modules`: Feature code and business operations.
- `shared`: Reusable code that does not depend on feature or route layers.
- `server`: Runtime-only infrastructure (security, logging, error boundaries for APIs).

## 4. Route Groups Explanation
- `(admin)`: Admin UI and protected resources.
- `(auth)`: Login/authentication surfaces.
- `api`: Route handlers using a centralized wrapper (`withRouteHandler`).

## 5. Loading & Error Strategy
### Loading Strategy
- Global fallback: `src/app/loading.tsx`
- Admin group fallback: `src/app/(admin)/loading.tsx`
- Auth group fallback: `src/app/(auth)/loading.tsx`
- Feature-segment loading fallbacks remain available at route level.

This ensures async server segments always render meaningful suspense UI.

### Error Handling Strategy
- Global boundary: `src/app/error.tsx`
- Global terminal boundary: `src/app/global-error.tsx`
- Group boundaries:
  - `src/app/(admin)/error.tsx`
  - `src/app/(auth)/error.tsx`
- Feature route boundaries:
  - `src/app/(admin)/admin/*/error.tsx`

Principles:
- No raw stack traces are shown to users.
- User-facing messages are generic and safe.
- Request digest/ID is surfaced when available.
- Errors are logged through centralized monitoring hooks.

## 6. Auth & RBAC Model
- Auth uses signed session cookies (`HttpOnly`, `Secure` in production, `SameSite=Strict`).
- Middleware protects `/admin/**`.
- Admin layout performs server-side guard as defense-in-depth.
- Role check currently enforces `admin` role.

Auth flow:
1. User submits login form.
2. Route validates input + CSRF + rate limit.
3. Credentials are checked (temporary in-memory source).
4. Signed session cookie is issued.
5. Middleware/layout permit admin route access.

## 7. Repository Pattern Explanation
Each domain uses:
- `domain`: domain types
- `application`: use-case layer
- `infrastructure`:
  - `repository.interface.ts`
  - `local.repository.ts` (dev fallback)
  - `api.repository.ts` (backend integration)
  - `repository.factory.ts` (runtime selection)

UI/hooks call use-cases; they do not depend directly on storage details.

## 8. Logging & Observability
- Structured JSON logging with `pino`: `src/server/logging/logger.ts`
- Per-request child logger via request context (`requestId`, `path`, `method`)
- Request ID injected by middleware (`x-request-id`)
- Central API error wrapper logs all exceptions in one place
- Client-side monitoring hooks remain available in `src/shared/lib/monitoring.ts`

## 9. Security Model
- CSP headers from middleware
- Session cookie hardening
- CSRF double-submit cookie pattern
- Login rate limiting by IP+email key
- Centralized API error normalization (no raw error leakage)

### CSRF Strategy
- Middleware seeds `csrf_token` cookie if missing.
- Client includes `x-csrf-token` header for mutation requests.
- Server validates cookie/header parity on mutation routes.

### Rate Limiting Strategy
- Login endpoint applies in-memory windowed limit.
- Defaults:
  - `AUTH_LOGIN_RATE_LIMIT_MAX=10`
  - `AUTH_LOGIN_RATE_LIMIT_WINDOW_MS=900000`

## 10. Environment Variables
| Variable | Required | Scope | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_APP_URL` | Yes | Client/Server | Public app URL |
| `NEXT_PUBLIC_API_BASE_URL` | No | Client/Server | External API base URL |
| `NEXT_PUBLIC_DATA_SOURCE` | No | Client/Server | `auto` / `api` / `local` repository switch |
| `AUTH_SESSION_SECRET` | Yes | Server | Session signing secret |
| `AUTH_ADMIN_EMAIL` | Yes | Server | Admin login email |
| `AUTH_ADMIN_PASSWORD` | Yes | Server | Admin login password |
| `AUTH_LOGIN_RATE_LIMIT_MAX` | No | Server | Max login attempts per window |
| `AUTH_LOGIN_RATE_LIMIT_WINDOW_MS` | No | Server | Login rate-limit window |
| `NEXT_PUBLIC_LOGGING_LEVEL` | No | Client/Server | `error/info/debug/warning/trace/fatal` |
| `LOG_LEVEL` | No | Server | Pino level (`fatal/error/warn/info/debug/trace/silent`) |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | Client | PostHog key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | Client | PostHog host |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Client | Sentry DSN |
| `NEXT_PUBLIC_SENTRY_DISABLED` | No | Client | Disable Sentry when set |

## 11. Local Development Guide
```bash
npm install
npm run dev
```

Quality commands:
```bash
npm run typecheck
npm run lint
npm run test
npm run check:architecture
npm run build
```

## 12. Docker Guide
The Dockerfile is multi-stage and uses Next.js standalone output.

Build:
```bash
docker build -t next-boilerplate-enterprise:latest .
```

Run:
```bash
docker run --rm -p 3000:3000 --env-file .env.production.local next-boilerplate-enterprise:latest
```

Healthcheck endpoint:
- `GET /api/health`

## 13. CI Pipeline Overview
CI job executes:
1. `npm run typecheck`
2. `npm run lint`
3. `npm run check:architecture`
4. `npm run test`
5. `npm run build`

Architecture violations and circular dependencies fail CI.

## 14. Architecture Rules
Enforced by:
- `eslint-plugin-boundaries` (editor/lint feedback)
- `dependency-cruiser` (pipeline-grade dependency policy)

Rules:
- `shared` cannot import from `modules`, `app`, or `server`
- `modules` cannot import from `app`
- `server` cannot import from `app`
- `app` can import from `modules`, `server`, and `shared`
- Circular dependencies are forbidden

## 15. How To Add A New Feature
1. Create `src/modules/<feature>/`.
2. Add `domain/types.ts`.
3. Add `application/use-cases.ts`.
4. Add `infrastructure/repository.interface.ts`.
5. Add infrastructure implementations (`local`/`api`).
6. Add feature UI/hooks in `components/` + `hooks/`.
7. Add app route under `src/app/(admin)/admin/<feature>/`.
8. Add route-level loading/error UI if needed.
9. Add tests.
10. Run quality gate commands before opening PR.

## 16. Testing Strategy
- Unit tests: Vitest (`*.test.ts`)
- Integration/E2E: Playwright where applicable
- Architecture tests: dependency-cruiser via `check:architecture`
- CI enforces all quality gates

## 17. Troubleshooting Guide
### Login fails with CSRF error
- Ensure the browser has `csrf_token` cookie.
- Confirm mutation request includes `x-csrf-token`.
- Verify middleware runs for the login page.

### Access denied on `/admin`
- Confirm valid session cookie exists.
- Confirm login user has `admin` role.

### Architecture check fails
- Run `npm run check:architecture`.
- Inspect forbidden import path in output and move dependency downward.

### Build warns about OpenTelemetry/Prisma instrumentation
- This warning comes from transitive instrumentation packages.
- Build can still complete successfully.

### Docker build issues
- Ensure Docker daemon is running.
- Rebuild with no cache if needed: `docker build --no-cache ...`

## 18. Data Layer Architecture
### Architecture diagram
```text
src/
└── shared/
    └── lib/
        ├── api/
        │   ├── http-client.ts        # axios instance + adapter bridge
        │   └── error-normalizer.ts   # transport error normalization
        ├── http/
        │   ├── http-adapter.interface.ts
        │   ├── fetcher.ts
        │   ├── server-fetcher.ts
        │   └── client-fetcher.ts
        └── react-query/
            ├── query-client.ts
            ├── stable-key.ts
            └── global-mutation-error.ts

src/modules/<domain>/
├── infrastructure/
│   └── api.repository.ts            # depends on HttpAdapter
├── query-keys.ts                    # stable query keys
└── hooks/                           # useQuery/useMutation integration
```

### Server flow
```text
Server Component / Route
  -> domain service/use-case
    -> domain repository (api.repository.ts)
      -> HttpAdapter.request()
        -> backend/API route
```

### Client flow
```text
Client component
  -> domain hook (useQuery/useMutation)
    -> domain service/use-case
      -> domain repository (api.repository.ts)
        -> HttpAdapter.request()
          -> React Query cache + network
```

### Query key strategy
- Use deterministic key segments for parameterized keys via `createStableKey(...)`.
- Stable serialization:
  - sorts object keys
  - removes `undefined` values
  - handles nested arrays/objects safely
- Never pass raw mutable objects directly as query key segments.

### Data Fetching & Caching Policy
- API route handlers: no implicit Next.js data cache assumptions.
- Client caching is owned by TanStack Query (`staleTime`, `gcTime`, retries).
- Server fetch adapter defaults to `cache: 'no-store'` in `server-fetcher.ts`.
- Use explicit `next.revalidate` or `next.tags` only for intentionally cacheable server fetches.
- Avoid mixing multiple cache authorities for the same data path.

### Hydration strategy
- Prefer server prefetch for first paint of expensive lists/details.
- Dehydrate on server and hydrate in client boundary.
- Client hooks reuse hydrated cache and avoid duplicate network fetch.
- Keep server/query keys identical for prefetch and client hooks.

### Transport adapter
- Domain repositories depend on `HttpAdapter` (`request<T>(config)`), not concrete transport clients.
- Current implementation uses axios-backed `httpAdapter`.
- Alternative adapters (fetch, GraphQL, gRPC gateway, mocks) can be introduced without touching domain APIs.

### Error handling flow
- Transport errors normalize to `ApiError`.
- Query mutations route errors through global mutation error mapper.
- `MutationCache.onError` logs normalized payload and notifies optional listeners.
- UI can subscribe to mapped global mutation errors without coupling to a toast library.

### Developer rules
- Do not call `fetch`/axios directly from UI components.
- Do not build ad-hoc query keys in components.
- Keep HTTP requests inside repository infrastructure.
- Reuse `createStableKey` for any new parameterized key.
- Keep API response and error shapes consistent.

### Add a new domain API (step-by-step)
1. Define repository contract in `infrastructure/repository.interface.ts`.
2. Implement HTTP-backed repository in `infrastructure/api.repository.ts` using `HttpAdapter`.
3. Add stable keys in `query-keys.ts`.
4. Add domain hooks for queries/mutations under `hooks/`.
5. Invalidate domain root/list keys from mutation hooks.
6. Add optional server prefetch and hydrate path for heavy pages.
7. Run `npm run typecheck`, `npm run lint`, `npm run check:architecture`, and `npm run build`.
