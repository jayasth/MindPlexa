// src/pages/api/generate-suggestion.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import { withAuth } from "../pages/api/authMiddleware.ts";

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { nodeId, nodeLabel } = req.body;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that generates suggestions to expand mind map nodes.",
          },
          {
            role: "user",
            content: `Suggest an idea to expand the node "${nodeLabel}":`,
          },
        ],
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 0.7,
      });

      let suggestion = "";
      if (response.choices[0]?.message?.content) {
        suggestion = response.choices[0].message.content.trim();
      }

      res.status(200).json({ suggestion });
    } catch (error) {
      console.error("Error generating suggestion:", error);
      res.status(500).json({ message: "Error generating suggestion" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default withAuth(handler);
