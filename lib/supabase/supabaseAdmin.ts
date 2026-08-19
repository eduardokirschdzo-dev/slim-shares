import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("A variável de ambiente NEXT_PUBLIC_SUPABASE_URL não foi definida.");
}
if (!serviceRoleKey) {
  throw new Error("A variável de ambiente SUPABASE_SERVICE_ROLE_KEY não foi definida.");
}

// Ignora RLS. NUNCA importar em componente 'use client'.
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});