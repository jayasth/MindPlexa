// src/pages/api/insights.ts

import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      // Fetch user insights data from the database or analytics service
      const insightsData = {
        totalIdeas: 10,
        brainstormingSessions: 5,
        // Add more insights data as needed
      };

      res.status(200).json(insightsData);
    } catch (error) {
      console.error("Error fetching user insights:", error);
      res.status(500).json({ message: "Error fetching user insights" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
