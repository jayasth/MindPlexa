import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

type Node = {
  data: {
    label: string;
    content: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { nodes } = req.body as { nodes: Node[] };

    try {
      const prompt = `Given the following nodes:\n${nodes
        .map((node: Node) => `- ${node.data.label}: ${node.data.content}`)
        .join(
          "\n"
        )}\nSuggest an organized structure for the nodes to improve clarity and efficiency.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that suggests an organized structure for nodes in a project.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        n: 1,
        stop: null,
        temperature: 0.7,
      });

      // Use optional chaining and nullish coalescing operator to safely access the content
      const suggestion =
        response.choices[0]?.message?.content?.trim() ??
        "No suggestion provided.";

      res.status(200).json({ organizedNodes: nodes, suggestion });
    } catch (error) {
      console.error("Error organizing nodes:", error);
      res.status(500).json({ error: "Error organizing nodes" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
