import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { title, description, duration, mode, participants } = req.body;

    // Implement the logic to create a new brainstorming session
    // You can use a database (e.g., Supabase) to store the session data

    // Generate an invite link for the session
    const inviteLink = `http://localhost:3000/brainstorming-sessions/${sessionId}`;

    res.status(201).json({ inviteLink });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
