import { createClient } from "@supabase/supabase-js";
import { RealtimeClient } from "@supabase/realtime-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
export const realtimeClient = new RealtimeClient(
  supabaseUrl!.replace("https", "wss"),
  {
    params: { apikey: supabaseAnonKey! },
  }
);
