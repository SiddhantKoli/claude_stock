import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://apsxzqiqtyolijwonltv.supabase.co";
const supabaseKey = "sb_publishable_jWfudEm-00pCBvwz-2qZbA_SykgHAkn";

export const supabase = createClient(supabaseUrl, supabaseKey);
