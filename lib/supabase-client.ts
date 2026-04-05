import { createBrowserClient } from '@supabase/ssr';

// Use this strictly for purely client-side operations as requested, to avoid Next.js Server Components leakage.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
