// src/pages/api/settings/theme.ts

import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "PUT") {
    try {
      // Update the respective settings in the database or configuration
      // ...

      res.status(200).json({ message: "Settings updated successfully" });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ message: "Error updating settings" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
