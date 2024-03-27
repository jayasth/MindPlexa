// src/pages/api/generate-nodes.ts
import type { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { keyword } = req.body;

    try {
      // Make an API request to OpenAI or any other AI service to generate related nodes based on the keyword
      const generatedNodes = [
        // Example generated nodes
        {
          id: "generated-1",
          type: "custom",
          data: { label: "Generated Node 1", color: "#FF6B6B" },
          position: { x: 100, y: 200 },
        },
        {
          id: "generated-2",
          type: "custom",
          data: { label: "Generated Node 2", color: "#4ECDC4" },
          position: { x: 300, y: 200 },
        },
      ];

      res.status(200).json(generatedNodes);
    } catch (error) {
      console.error("Error generating nodes:", error);
      res.status(500).json({ message: "Error generating nodes" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default handler;
