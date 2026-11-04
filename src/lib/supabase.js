import { createClient } from "@supabase/supabase-js";

const financeiro = import.meta.env.VITE_APP_MODE === "financeiro";
const url = financeiro
  ? import.meta.env.VITE_FINANCEIRO_SUPABASE_URL
  : import.meta.env.VITE_SUPABASE_URL;
const key = financeiro
  ? import.meta.env.VITE_FINANCEIRO_SUPABASE_PUBLISHABLE_KEY
  : import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = url && key ? createClient(url, key) : null;
