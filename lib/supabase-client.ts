import { createClient } from '@supabase/supabase-js';

// Use this strictly for purely client-side operations as requested, to avoid Next.js Server Components leakage.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
