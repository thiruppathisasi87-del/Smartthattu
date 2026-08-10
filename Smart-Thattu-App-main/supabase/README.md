# SmartThattu + Supabase

SmartThattu works in two modes:

1. **Local-only mode (default)** — all data is saved in your browser via localStorage. No account required.
2. **Supabase mode** — sign in to sync your family, meals, chat and settings across devices.

## Setup

1. Create a Supabase project at https://supabase.com.
2. Go to SQL Editor → paste the contents of `migrations/001_init.sql` and run it.
   This creates the tables, RLS policies and a trigger that auto-creates a `user_settings` row when a new user signs up.
3. In your project **Settings → API**, copy the Project URL and anon public key.
4. Add these to your environment (or `.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

5. Restart the dev server. You'll now see a "Sign in" button in the top navigation.

## What gets synced

- Family members (`family_members`)
- Meals & analysis (`meals`)
- Chat history (`chat_messages`)
- App settings (`user_settings`)

All tables use Row Level Security (RLS) so users can only access their own data (`user_id = auth.uid()`).

## Email/password auth

SmartThattu uses Supabase's built-in email + password auth. You can also enable OAuth providers from the Supabase dashboard — the app uses the standard Supabase session so any provider will work.

## Data model

See `migrations/001_init.sql` for the full schema.
