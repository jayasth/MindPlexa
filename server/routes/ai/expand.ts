import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { nodeId, nodeContent } = req.body;

    try {
      const prompt = `Given the following node content:\n${nodeContent}\nExpand the content with additional details and ideas.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that expands the content of a node with additional details and ideas.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 100,
        n: 1,
        stop: null,
        temperature: 0.7,
      });

      // Use optional chaining and nullish coalescing to handle potential null values
      const expandedContent =
        response.choices[0]?.message?.content?.trim() ??
        "No expanded content available.";

      res.status(200).json({ nodeId, expandedContent });
    } catch (error) {
      console.error("Error expanding node:", error);
      res.status(500).json({ error: "Error expanding node" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
