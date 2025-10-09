// public/js/supabaseClient.js
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL =
  (window && window.env && window.env.NEXT_PUBLIC_SUPABASE_URL) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL) ||
  null;

const SUPABASE_KEY =
  (window && window.env && window.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  null;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(
    "Supabase: variáveis não encontradas. Crie public/js/env.js com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY, ou configure via bundler."
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
