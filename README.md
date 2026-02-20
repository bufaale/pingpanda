# SaaS AI Boilerplate

> The AI-First SaaS starter kit. Ship your next product in days, not months.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/saas-ai-boilerplate)

## Features

- **AI-Powered** -- Vercel AI SDK 6 with multi-provider streaming (Claude, GPT)
- **Authentication** -- Supabase Auth (email, Google, GitHub OAuth)
- **Payments** -- Stripe subscriptions, one-time, and usage-based billing
- **Email** -- Resend transactional emails (welcome, subscription, password reset)
- **Dashboard** -- Beautiful sidebar layout with dark/light mode
- **Admin Panel** -- User management and subscription stats
- **Landing Page** -- Hero, features, pricing, testimonials, FAQ
- **Rate Limiting** -- Per-user AI rate limiting (free vs pro tiers)
- **Database** -- Supabase PostgreSQL with Row Level Security
- **TypeScript** -- Strict mode, fully typed

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 4 + shadcn/ui |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL + RLS) |
| Payments | Stripe |
| AI | Vercel AI SDK 6 |
| Email | Resend |
| Deploy | Vercel |

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/saas-ai-boilerplate.git
   cd saas-ai-boilerplate
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your API keys (see `.env.example` for all required variables).

3. **Set up Supabase**
   - Create a project at [supabase.com](https://supabase.com)
   - Run the migration SQL from `supabase/migrations/00001_initial_schema.sql` in the SQL Editor
   - Enable Google and GitHub OAuth in Authentication > Providers

4. **Set up Stripe**
   - Create products and prices in your Stripe Dashboard
   - Add price IDs to `.env.local`
   - Set up webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events to listen for: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`

5. **Start development**
   ```bash
   npm run dev
   ```

## Project Structure

```
src/
├── app/
│   ├── (marketing)/     # Landing page
│   ├── (auth)/          # Login, signup, forgot password
│   ├── (dashboard)/     # Protected dashboard pages
│   └── api/             # API routes
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── landing/         # Landing page sections
│   ├── dashboard/       # Dashboard components
│   ├── auth/            # Auth forms
│   └── ai/             # AI chat component
├── lib/
│   ├── supabase/        # Supabase clients
│   ├── stripe/          # Stripe utilities
│   ├── ai/              # AI providers + rate limiting
│   └── email/           # Resend email templates
├── config/              # Site configuration
└── types/               # TypeScript types
```

## Customization

1. **Branding** -- Update `src/config/site.ts` with your app name and links
2. **Pricing** -- Edit plans in `src/lib/stripe/plans.ts`
3. **AI Models** -- Configure providers in `src/lib/ai/providers.ts`
4. **Theme** -- Customize colors in `src/app/globals.css`
5. **Components** -- All shadcn/ui components in `src/components/ui/`

## License

MIT
