// server\routes\ai\connect.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Node = {
  data: {
    label: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { nodes } = req.body;

    try {
      const prompt = `Given the following nodes:\n${nodes
        .map((node: Node) => `- ${node.data.label}`) // Use the Node type here
        .join(
          "\n"
        )}\nSuggest a connection between two nodes to enhance the project flow.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that suggests connections between nodes in a project.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 0.7,
      });

      // Ensure suggestion is a string and trim it, provide a fallback if null or undefined
      const suggestion = response.choices[0]?.message?.content?.trim() ?? "";

      // Only attempt to parse suggestion if it's not empty
      let sourceNodeId = "",
        targetNodeId = "";
      if (suggestion) {
        const parsedSuggestion = suggestion.split(" -> ");
        if (parsedSuggestion.length === 2) {
          [sourceNodeId, targetNodeId] = parsedSuggestion;
        } else {
          // Handle case where suggestion format does not meet expectation
          console.error("Suggestion format unexpected:", suggestion);
        }
      }

      res.status(200).json({ sourceNodeId, targetNodeId });
    } catch (error) {
      console.error("Error connecting nodes:", error);
      res.status(500).json({ error: "Error connecting nodes" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
