# PACT

**Keep your word to yourself.** PACT is a personal accountability and finance operating system built around the daily loop: plan, commit, execute, measure, learn, improve.

## Current foundation

The repository contains the Next.js 16 / TypeScript / Tailwind foundation, the first PACT visual system and an honest setup-oriented entry screen. Data-backed V0 modules are intentionally staged; the app does not fabricate tasks, financial figures, or integration activity.

## Local development

1. Copy `.env.example` to `.env.local` and enter Supabase public keys when the project is provisioned.
2. Run `npm install`.
3. Run `npm run dev`, then open `http://localhost:3000`.

`npm run lint` checks code quality. `npm run build -- --webpack` produces a production build in environments where the default Turbopack process is unavailable.

## Architecture and product decisions

- [Product scope](docs/product.md)
- [Architecture and proposed schema](docs/architecture.md)
- [Design system](docs/design-system.md)

## Planned V0 modules

Authentication and onboarding; commitments with hidden consequences; expenses, categories and budgets; an adaptive Today dashboard; explainable discipline scoring; daily sheet and insights; then verified, optional developer integrations.

Secrets, OAuth credentials and service-role keys must never be committed. User data will be isolated with Supabase RLS.
