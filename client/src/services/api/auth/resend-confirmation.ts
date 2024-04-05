import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or key");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

export default async function resendConfirmation(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    // If the request method is not POST
    res.setHeader("Allow", "POST");
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { email, password, provider } = req.body;

  // Ensure email is provided
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    let error;
    if (provider === "google") {
      // Sign in with Google
      ({ error } = await supabaseAdmin.auth.signInWithOAuth({ provider }));
    } else {
      // Sign in with email
      ({ error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      }));
    }

    if (error) {
      throw error;
    }

    return res
      .status(200)
      .json({ message: "Confirmation email has been resent" });
  } catch (error) {
    return res.status(500).json({ error: (error as Error).message });
  }
}
