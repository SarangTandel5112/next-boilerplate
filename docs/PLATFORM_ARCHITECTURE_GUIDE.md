# Next.js Platform Architecture Guide (Junior Onboarding)

## 1. Project Overview

This project is a **production-oriented Next.js App Router boilerplate** for admin/SaaS-style web applications.

It is designed for applications that need:
- Protected admin surfaces
- Consistent API interaction patterns
- Scalable feature organization
- Strong security defaults
- CI/quality gates that prevent architecture drift

### What this boilerplate supports

It supports building:
- Internal admin portals
- SaaS backoffice applications
- Enterprise dashboards with role-protected routes
- Multi-feature CRUD-heavy web apps

### Why this architecture was chosen

This repository is intentionally structured to prevent common large-project failures:
1. Feature code becoming tightly coupled
2. UI calling APIs directly with inconsistent error handling
3. Business rules scattered across components
4. Security rules implemented inconsistently
5. New developers breaking module boundaries accidentally

### Problems this structure solves in large projects

1. **Spaghetti imports** are controlled by boundary rules.
2. **Inconsistent request handling** is reduced with shared transport and repository layers.
3. **Regressions** are caught early via CI (typecheck, lint, architecture checks, tests, build).
4. **Security drift** is reduced by centralized auth/session/csrf/rate-limit code.
5. **Onboarding time** is reduced by explicit folders and strict responsibilities.

---

## 2. Technology Stack

Below is each major tool and why it exists in this system.

### Next.js App Router

What it does:
- File-based routing with layouts, loading boundaries, error boundaries, route groups, and server route handlers.

Why used here:
- This app relies on server-first rendering and route-group architecture (`(admin)`, `(auth)`).

Problem solved:
- Better composition of protected sections and server-side data loading.

Integration here:
- Admin access checks are in middleware and admin layout.
- API endpoints live under `src/app/api/**/route.ts`.

### React

What it does:
- UI rendering and stateful components.

Why used here:
- Core framework for component composition.

Problem solved:
- Declarative UI and reusable component model.

Integration here:
- Presentational/admin components in `src/modules/**/components`.

### TypeScript

What it does:
- Static typing.

Why used here:
- Prevent runtime shape mismatches in API/domain logic.

Problem solved:
- Catches invalid assumptions during build rather than in production.

Integration here:
- Domain types are centralized in each module’s `domain/types.ts`.

### TanStack Query

What it does:
- Client-side caching, query lifecycle, mutations, cache invalidation.

Why used here:
- Admin UI is CRUD-heavy and benefits from cache coherence.

Problem solved:
- Avoids hand-rolled loading/error/cache logic per component.

Integration here:
- QueryClient provider in `src/app/providers.tsx`.
- Query/mutation hooks in module hooks.

### ESLint architecture boundaries

What it does:
- Enforces import-direction rules.

Why used here:
- Keeps layers clean over time.

Problem solved:
- Prevents forbidden imports like `shared -> modules`.

Integration here:
- Configured in `eslint.config.mjs` via `eslint-plugin-boundaries`.

### dependency-cruiser

What it does:
- Static dependency graph checks and circular dependency detection.

Why used here:
- CI-grade architecture enforcement beyond editor lint hints.

Problem solved:
- Blocks circular and forbidden cross-layer imports in pipeline.

Integration here:
- Rules in `.dependency-cruiser.cjs`, command `npm run check:architecture`.

### Docker

What it does:
- Consistent containerized build/runtime.

Why used here:
- Production reproducibility and deployment portability.

Problem solved:
- “Works on my machine” drift.

Integration here:
- Multi-stage Dockerfile using Next standalone output.
- Non-root runtime user and healthcheck endpoint.

### Zod

What it does:
- Runtime schema validation.

Why used here:
- Protects input surfaces for API and forms.

Problem solved:
- Prevents invalid payloads from entering business logic.

Integration here:
- API request validation and module form schemas.

### Pino logging

What it does:
- Structured JSON logging.

Why used here:
- Production-friendly logs for search/aggregation.

Problem solved:
- Unstructured console logs are difficult to correlate.

Integration here:
- `src/server/logging/logger.ts` + per-request child logger.

### React Query hydration

What it does:
- Reuses server-fetched data client-side.

Why used here:
- Avoid immediate duplicate client fetches.

Problem solved:
- Double loading on first render.

Integration here:
- Current pattern primarily uses `initialData` passed from server page to client hooks.

### Server Components

What it does:
- Execute rendering/data work on server by default.

Why used here:
- Better performance, reduced client bundle, secure server-side access checks.

Problem solved:
- Avoids shipping sensitive or heavy logic to browser.

Integration here:
- Admin pages are async server components that fetch initial lists.

---

## 3. Folder Structure (Deep Explanation)

Top-level structure:

```text
src/
  app/
  modules/
  shared/
  server/
```

### `src/app`

Purpose:
- Routing and route-level UI boundaries (page/layout/loading/error).

Belongs here:
- `page.tsx`, `layout.tsx`, route handlers (`api/**/route.ts`), route-group files.

Must NOT go here:
- Reusable business logic and domain models.

Example:
- `src/app/(admin)/layout.tsx` verifies session and role before rendering admin shell.

### `src/modules`

Purpose:
- Feature/domain code (products, brands, categories, auth, admin).

Belongs here:
- Domain types
- Application use-cases
- Infrastructure repositories
- Feature hooks and feature UI

Must NOT go here:
- App routing files
- Cross-domain shared utilities that could be reused globally

Example product module structure:

```text
src/modules/products/
  domain/
  application/
  infrastructure/
  hooks/
  components/
  schemas/
  types/
```

### `src/shared`

Purpose:
- Cross-domain primitives and utilities.

Belongs here:
- Config/env
- Generic transport abstractions
- Shared react-query helpers
- Shared hooks/types/ui primitives

Must NOT go here:
- Feature-specific business logic.

Important rule:
- `shared` cannot import `modules`, `app`, or `server`.

### `src/server`

Purpose:
- Server-only platform concerns.

Belongs here:
- Auth/session/rbac
- CSRF/rate limiting
- Logging and API error wrappers

Must NOT go here:
- UI components
- Client hooks

### Dependency direction rules

Enforced rules (lint + depcruise):
1. `shared` cannot import `modules`, `app`, `server`
2. `modules` cannot import `app`
3. `server` cannot import `app`
4. `app` can import `modules`, `shared`, `server`

---

## 4. Architecture Principles Used

### Clean architecture (practical version)

Simple interpretation used in this repo:
1. UI displays data and collects input.
2. Use-cases coordinate domain behavior.
3. Infrastructure handles transport/storage details.
4. Shared/server provide platform capabilities.

### Separation of concerns

Examples:
- Validation in schemas/use-cases, not in JSX render blocks.
- Transport details in repositories/adapters, not in UI.
- Security middleware separate from feature components.

### Repository pattern

Each domain defines a repository interface and implementations (`api`, `local`).
UI calls use-cases; use-cases call repository; repository handles transport.

### Domain-driven modular structure

Products code lives with products code. Same for brands/categories/auth.
This prevents “misc utils + giant folder” anti-pattern.

### Transport abstraction

`HttpAdapter` decouples domain repository from concrete HTTP library.
Today axios adapter is used; fetch adapter exists for future extension.

### Server/client boundary separation

- Server-only concerns are in `src/server` and server components.
- Client hooks/components carry `'use client'` when needed.

---

## 5. Data Layer Architecture

### Main pieces

1. `shared/lib/http`:
   - Generic adapter contract (`HttpAdapter`)
   - Fetch adapter factory
   - Server/client fetch adapter instances
2. `shared/lib/api/http-client.ts`:
   - Axios instance
   - Axios-based `httpAdapter`
   - Response normalization path
3. Domain repository (`modules/*/infrastructure/api.repository.ts`):
   - Uses adapter to perform typed requests
4. Use-case layer (`application/use-cases.ts`):
   - Validates/sanitizes
   - Resolves repository
5. React Query hooks (`hooks/use*.ts`):
   - Query/mutation orchestration for UI

### Server component data flow

```text
Server page (async)
  -> build query from URL params
  -> call module use-case (listProducts/listBrands/...)
  -> repository factory chooses API/local
  -> api.repository -> httpAdapter.request(...)
  -> response mapped back to server page
  -> server page passes initialData to client component hook
```

### Client component data flow

```text
Client component
  -> custom hook (useProductsList, etc.)
  -> TanStack useQuery/useMutation
  -> queryFn/mutationFn call module use-case
  -> use-case resolves repository
  -> repository uses httpAdapter
  -> response cached in React Query
  -> UI rerenders from cache state
```

### Why this is useful

- Fetch logic is centralized.
- Domain code is testable via adapter/repository boundaries.
- UI code remains focused on UX and state transitions.

---

## 6. React Query Integration

### Why React Query is used

It handles:
- Loading/error states
- Cache lifecycle
- Mutation orchestration
- Invalidation and optimistic updates

### Caching behavior in this repo

Defaults from `APP_CONFIG.query` are loaded into QueryClient:
- `staleTime`
- `gcTime`
- retry behavior
- `refetchOnWindowFocus`

### Query keys

Domain keys are centralized (`productKeys`, `brandKeys`, `categoryKeys`).
Parameterized keys use `createStableKey(...)` for deterministic serialization.

### Mutations

Pattern used:
1. `useMutation` calls use-case.
2. `onSuccess` invalidates relevant keys.
3. For delete, some hooks use optimistic updates + rollback snapshots.

### Prefetch/hydration strategy currently used

This repo mostly uses `initialData` passed from server pages to client hooks.
That avoids immediate duplicate fetches for first render.

### Common junior mistakes

1. Building query keys inline inside components.
2. Invalidating too broadly (`all`) when narrower key is enough.
3. Forgetting rollback in optimistic mutations.
4. Using mutable objects as key segments without stable serialization.

---

## 7. Server vs Client Components

### Server Components

What they are:
- Default in App Router. Run on server.

Use for:
- Initial data loading
- Auth-aware rendering
- Large static/SSR work

Example:
- `src/app/(admin)/admin/products/page.tsx` parses `searchParams` and fetches initial list server-side.

### Client Components

What they are:
- Files with `'use client'`.

Use for:
- Browser APIs
- Interactivity/event handlers
- React Query hooks

Example:
- `src/modules/products/hooks/useProductsList.ts`
- `src/modules/products/components/ProductsAdminPage.tsx`

### Why this project uses both

- Server for security and first-load performance.
- Client for interactive admin filtering, mutations, and optimistic UX.

---

## 8. API Layer Design

### Core design

1. Domain repository files (`api.repository.ts`) perform typed calls.
2. They depend on `HttpAdapter`, not UI code.
3. Use-cases call repositories; UI calls use-cases/hooks.

### Why UI never calls fetch directly

If UI calls fetch directly:
- Error handling becomes inconsistent.
- Request IDs and auth/cookie behavior become inconsistent.
- Repeated boilerplate spreads through components.

### How to add a new API endpoint (safe path)

Example: Add `GET /products/:id/history`

1. Add domain type in `products/domain/types.ts`.
2. Add repository contract method in `repository.interface.ts`.
3. Implement method in `api.repository.ts` using adapter.
4. Add use-case in `application/use-cases.ts` (validation + normalization).
5. Add React Query key and hook.
6. Use hook inside component.
7. Add tests for schema/use-case behavior.

---

## 9. Security Architecture

### Authentication model

- Login route validates credentials using bcrypt compare.
- Sessions are signed tokens in `HttpOnly` cookie.
- Admin routes protected at middleware and admin layout (defense in depth).

### Session handling

Session payload includes:
- `sub` (user id)
- `role`
- `iat`
- `exp`
- `jti`

Supports:
- Key rotation via active + previous secrets
- Revocation-ready structure via `jti` checks

### CSRF protection

Double-submit cookie pattern:
1. Middleware seeds CSRF cookie if missing.
2. Client sends `x-csrf-token` for mutations.
3. Server validates cookie/header match.

### Rate limiting

- Abstraction with memory and redis implementations.
- Production requires Redis.
- Login route enforced with IP/email key and retry window.

### Security headers and CSP

Middleware and next headers set:
- CSP, HSTS, X-Frame-Options, etc.
- Request nonce included for CSP policy.

### Environment validation

`Env.ts` enforces critical production vars and bcrypt hash format for admin password.
Fail-fast behavior prevents booting unsafe production config.

---

## 10. Logging & Observability

### Pino logger

- Structured JSON logs.
- Redacts sensitive fields.
- Supports log levels via env.

### Request IDs

- Middleware generates `x-request-id` per request.
- API wrapper ensures request ID is attached to responses.
- Client adapter also sends stable browser-session request ID for correlation.

### Centralized API error handling

`withRouteHandler`:
1. Creates request-scoped logger.
2. Applies CSRF checks for mutation methods.
3. Normalizes thrown errors into standard response shape.
4. Logs metadata (`statusCode`, `errorCode`, details).

### Why observability matters

Without this, production incidents become guesswork.
With this, you can answer:
- Which request failed?
- Which route/method failed?
- Which error code was returned?
- How often is it happening?

---

## 11. Error Handling Strategy

### API error format

All route-handler errors are normalized to:

```json
{
  "success": false,
  "error": {
    "code": "SOME_CODE",
    "message": "Human-readable message"
  },
  "requestId": "..."
}
```

### UI boundaries

- Root: `src/app/error.tsx`
- Global fallback: `src/app/global-error.tsx`
- Route groups: `(admin)` and `(auth)` have dedicated error/loading boundaries

### Mutation error layer

`global-mutation-error.ts`:
- Maps transport errors to user-friendly message categories.
- Provides subscription API for optional toast integration without coupling this layer to a specific UI library.

### Error propagation path

```text
throw error -> withRouteHandler catches
  -> normalized AppError
  -> structured JSON response
  -> adapter normalizes to ApiError
  -> React Query receives error
  -> mutation global mapper + logger + UI handling
```

---

## 12. Performance Strategy

### Server rendering strategy

- Admin list pages fetch initial data server-side.
- Client receives initial state and avoids blank first paint.

### Client caching strategy

- React Query maintains cached query state.
- Stale/gc behavior from centralized app config.

### Hydration strategy

- Current pattern: `initialData` hydration in hooks.
- Avoids immediate duplicate requests after server render.

### Prefetching

- Server pages build initial query from URL and fetch list/filter metadata in parallel (`Promise.all`).

### Bundle efficiency

- Heavy admin views are loaded with `next/dynamic` in admin pages.

### Avoiding unnecessary requests

1. Search input debounced before query-param updates.
2. Query keys are stable and deterministic.
3. Hook invalidation is explicit per domain key families.

---

## 13. DevOps & Deployment

### Docker setup

- Multi-stage build:
  1. deps
  2. builder
  3. runtime
- Runtime uses non-root user.
- Next standalone output reduces runtime footprint.

### Health checks

- `/api/health` endpoint returns status/timestamp.
- Docker `HEALTHCHECK` probes that endpoint.

### CI pipeline

CI runs:
1. typecheck
2. lint
3. architecture checks
4. tests
5. build

### Why these checks matter

They prevent shipping code that:
- Breaks types
- Violates architecture rules
- Introduces circular deps
- Fails at compile/deploy time

---

## 14. Development Workflow (Step-by-step)

### Add a new feature module (example: `orders`)

1. Create `src/modules/orders/`.
2. Add `domain/types.ts`.
3. Add `infrastructure/repository.interface.ts`.
4. Add `infrastructure/api.repository.ts` and optional local repository.
5. Add `application/use-cases.ts`.
6. Add `query-keys.ts` and hooks.
7. Add `components/` UI.
8. Add route under `src/app/(admin)/admin/orders/page.tsx`.
9. Pass server `initialData` into client view.
10. Run `typecheck`, `lint`, `check:architecture`, `test`, `build`.

### Add a new API endpoint

1. Add route handler under `src/app/api/.../route.ts`.
2. Wrap with `withRouteHandler`.
3. Validate request with Zod.
4. Return standardized success/error payloads.

### Add a new query

1. Add key in domain `query-keys.ts`.
2. Build hook with `useQuery`.
3. Use stable key serialization for params.
4. Use query in client component.

### Add a new page

1. Decide server vs client.
2. If data-heavy initial render, make server page fetch initial data.
3. Render client component with initial state props.

---

## 15. Architecture Rules (Important)

1. Do not call `fetch` or axios directly in feature UI components.
2. Do not bypass use-cases/repositories for domain API calls.
3. Do not import `server/*` into client components.
4. Do not place feature logic inside `shared`.
5. Do not create ad-hoc query keys in component files.
6. Do not add forbidden cross-layer imports.
7. Do not rely on local repositories in production mode.

Why these rules exist:
- To keep logic centralized, testable, secure, and maintainable.

---

## 16. Common Mistakes Junior Developers Make

1. Putting business logic in JSX files.
2. Skipping schema validation before mutation calls.
3. Invalidating all cache keys after every mutation.
4. Mixing server and client imports incorrectly.
5. Creating unstable query keys from raw objects.
6. Forgetting to include new feature in architecture boundaries mentally.
7. Ignoring requestId propagation when debugging incidents.
8. Assuming dev local repository behavior is valid in production.

How to avoid them:
- Follow folder responsibilities strictly.
- Copy existing module patterns (products/brands/categories) instead of inventing new ones.
- Run quality commands before PR.

---

## 17. Future Scalability

### Microservices

- `HttpAdapter` allows redirecting domain repositories to BFF/microservice endpoints without rewriting UI.

### BFF layer

- Domain repositories can target a single BFF URL while keeping feature contracts stable.

### GraphQL

- Implement a GraphQL adapter that satisfies `HttpAdapter` and switch repository internals gradually.

### Redis caching

- Redis is already integrated for production rate limiting.
- Similar infrastructure patterns can be used for response caching/session revocation stores.

### Distributed systems

- Request IDs + structured logs improve cross-service tracing.
- Strict module boundaries reduce coupling so teams can split domains into services later.

---

## Practical “How to work safely” checklist

Before you merge code:
1. Did you put code in the correct layer?
2. Did you avoid direct transport calls from UI?
3. Did you reuse domain keys/hooks rather than duplicating?
4. Did you preserve standardized error handling?
5. Did all quality checks pass?

Commands:

```bash
npm run typecheck
npm run lint
npm run check:architecture
npm run test
npm run build
```
