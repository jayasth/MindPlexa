// src/pages/api/ideas.ts

import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      // Fetch ideas from the database based on the authenticated user
      const ideas = [
        {
          id: 1,
          title: "Idea 1",
          description: "Description of idea 1",
        },
        {
          id: 2,
          title: "Idea 2",
          description: "Description of idea 2",
        },
      ];

      res.status(200).json(ideas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      res.status(500).json({ message: "Error fetching ideas" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
