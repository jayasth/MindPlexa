import type { NextApiRequest, NextApiResponse } from "next";

// Define the SessionData interface
interface SessionData {
  title: string;
  description: string;
  duration: number;
  mode: string;
  participants: string[];
}

// Define the createSession function
async function createSession(sessionData: SessionData) {
  // Implement your logic to create a session here.
  // This might involve interacting with a database or an external API.
  // For now, let's just return a mock session id.
  return "mock-session-id";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { title, description, duration, mode, participants } = req.body;

    // Use the createSession function to create a new brainstorming session
    const sessionId = await createSession({
      title,
      description,
      duration,
      mode,
      participants,
    });

    // Generate an invite link for the session
    const inviteLink = `http://localhost:3000/brainstorming-sessions/${sessionId}`;

    res.status(201).json({ inviteLink });
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
