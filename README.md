# Noma Platform Web

React + Vite frontend for the Noma platform, built on the [AlignUI](https://alignui.com) design system. Component foundations are consolidated from the finance, HR, and marketing AlignUI templates — shared primitives are deduplicated; domain widgets are namespaced by area.

## Stack

- **React 18** + **TypeScript** + **Vite**
- **TanStack Router** — file-based routing (`src/routes/`)
- **Apollo Client** — GraphQL client (points at `noma-platform-core` `/graphql`)
- **Sentry** — error monitoring & performance (optional via env)
- **Tailwind CSS** with AlignUI design tokens
- **Radix UI** primitives
- **Jotai** for state, **next-themes** for dark mode

## Environment

Copy `.env.example` to `.env.local` and adjust as needed:

| Variable | Description |
|----------|-------------|
| `VITE_GRAPHQL_URL` | GraphQL endpoint (default `http://localhost:4000/graphql`) |
| `VITE_SENTRY_DSN` | Sentry DSN — leave blank to disable locally |
| `VITE_SENTRY_ENVIRONMENT` | Sentry environment tag |
| `SENTRY_AUTH_TOKEN` | Source map upload (CI/production builds only) |

## Project structure

```
src/
├── routes/                          # TanStack Router file-based routes
│   ├── __root.tsx                   # App shell (sidebar, header, outlet)
│   └── index.tsx                    # Home page
├── routeTree.gen.ts                 # Auto-generated route tree (do not edit)
├── router.tsx                       # Router instance & type registration
├── lib/
│   ├── apollo-client.ts             # Apollo Client setup
│   ├── sentry.ts                    # Sentry initialization
│   └── navigation.tsx               # Link/usePathname adapters for AlignUI components
├── components/
│   ├── ui/                          # 44 shared AlignUI primitives (incl. color-picker, scroll-area)
│   ├── widgets/
│   │   ├── finance/                 # Banking & finance dashboard widgets
│   │   ├── hr/                      # HR management widgets
│   │   └── marketing/               # Marketing & sales widgets
│   ├── empty-state-illustrations/
│   │   ├── finance/                 # Finance empty states
│   │   └── hr/                      # HR empty states
│   ├── layout/                      # Header, sidebar, mobile header
│   └── *.tsx                        # Shared & domain-specific components (deduplicated)
├── hooks/
├── lib/
├── utils/
└── providers.tsx                    # Theme, tooltip, jotai providers
```

## Getting started

```bash
cd noma-platform-web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Adding routes

Create a new file under `src/routes/` — TanStack Router regenerates `routeTree.gen.ts` on dev/build:

```tsx
// src/routes/about.tsx
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/about')({
  component: AboutPage,
});
```

## GraphQL

Apollo Client is configured in `src/lib/apollo-client.ts` and provided via `Providers`. Example query:

```tsx
import { gql, useQuery } from '@apollo/client';

const HEALTH_QUERY = gql`
  query Health {
    __typename
  }
`;
```

## Importing widgets

```tsx
// Finance
import WidgetTotalBalance from '@/components/widgets/finance/widget-total-balance';

// HR
import { WidgetSchedule } from '@/components/widgets/hr/widget-schedule';

// Marketing
import { WidgetGeography } from '@/components/widgets/marketing/widget-geogprahy';
```

## Source templates

| Domain    | AlignUI template              |
|-----------|-------------------------------|
| Finance   | template-finance-master       |
| HR        | template-hr-master            |
| Marketing | marketing-template-master     |

Shared UI components (`components/ui/`) are sourced from the finance template with marketing-only additions (`color-picker`, `scroll-area`). Duplicate shared components (e.g. `widget-box`, `company-switch`, charts) exist once at the `components/` root.
