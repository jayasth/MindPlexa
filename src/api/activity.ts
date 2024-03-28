// src/pages/api/activity.ts

import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      // Fetch user activity data from the database or analytics service
      const activityData = [
        {
          id: 1,
          message: "Created a new idea",
          timestamp: "2023-05-25T10:30:00.000Z",
        },
        {
          id: 2,
          message: "Participated in a brainstorming session",
          timestamp: "2023-05-24T14:45:00.000Z",
        },
        // Add more activity data as needed
      ];

      res.status(200).json(activityData);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      res.status(500).json({ message: "Error fetching user activity" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
