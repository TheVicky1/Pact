# Architecture

Next.js App Router renders server-first screens. Feature folders own UI, schemas, domain services, and repositories. Route handlers/server actions authenticate before accessing a repository. Client components only handle interaction.

```
src/
  app/                 routes and layouts
  components/          shared primitives
  features/
    tasks/ expenses/ dashboard/ discipline/ integrations/ onboarding/
      ui/ domain/ data/ schemas/ types/
  lib/                 supabase, time, validation, shared utilities
```

## Supabase schema proposal

`profiles(id PK -> auth.users, timezone, display_name)`; `tasks(id, user_id, title, description, deadline_at, priority, status, completed_at)`; `task_consequences(id, task_id, title, status, activated_at, resolved_at)`; `task_reminders(id, task_id, offset_minutes, enabled)`; `expense_categories(id, user_id, name, color, sort_order, is_frequent)`; `expenses(id, user_id, category_id, amount, note, incurred_at)`; `budgets(id, user_id, period, amount, category_id nullable)`; `daily_targets(id, user_id, source, target, effective_from)`; `integrations(id, user_id, provider, status, external_handle, encrypted_token_ref)`; `daily_activity(id, user_id, source, activity_date, completed, target)`; `discipline_scores(id, user_id, score_date, score, breakdown jsonb)`; `insights(id, user_id, kind, body, created_at)`; `user_preferences(user_id PK, motivation_background_path, notification_settings jsonb)`.

All user-owned tables use `user_id` indexes and RLS restricted to `auth.uid() = user_id`; child task rows validate parent ownership. Service-role access remains server-only. Phase 2 implements only `profiles`, created by an `auth.users` trigger. Its RLS allows an authenticated user to select or update only the row whose primary key equals `auth.uid()`; it intentionally has no client insert policy.

Deadlines are `timestamptz`; profiles supply the display timezone. Completing exactly at a deadline is allowed. Consequences are not queried for normal task cards. Expenses default to the server-derived current day and suggestions always require confirmation. Score calculation is a versioned, explainable domain function.
