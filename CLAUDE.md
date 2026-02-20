# SaaS AI Boilerplate

## Tech Stack
- Next.js 16 (App Router) + TypeScript strict
- Tailwind CSS 4 + shadcn/ui
- Supabase (PostgreSQL + Auth + RLS)
- Stripe (subscriptions + one-time payments)
- Vercel AI SDK 6 (multi-provider: Claude + OpenAI)
- Resend (transactional email)

## Project Structure
- `src/app/(marketing)/` — Public landing page
- `src/app/(auth)/` — Login, signup, forgot password
- `src/app/(dashboard)/` — Protected app pages (sidebar layout)
- `src/app/api/` — API routes (chat, stripe, auth)
- `src/components/` — Reusable components
- `src/lib/` — Utilities (supabase, stripe, ai, email)
- `src/config/` — App configuration
- `src/types/` — TypeScript types
- `supabase/migrations/` — Database migrations

## Conventions
- TypeScript strict mode
- ESM modules only
- Prettier + ESLint for formatting
- Server Components by default, "use client" only when needed
- All API routes in `src/app/api/`
- Supabase RLS for data access control

## Key Patterns
- Auth: Supabase SSR with middleware session refresh
- Stripe: Webhook-driven subscription sync
- AI: Vercel AI SDK streamText with rate limiting
- Email: Resend with HTML templates

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run format` — Format code with Prettier
- `npm run lint` — Run ESLint
