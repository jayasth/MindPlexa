import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { nodeId, content } = req.body;

    try {
      const prompt = `Please summarize the following content:\n${content}`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that summarizes content.",
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

      const summary = response.choices[0]?.message?.content.trim();

      res.status(200).json({ nodeId, summary });
    } catch (error) {
      console.error("Error summarizing content:", error);
      res.status(500).json({ error: "Error summarizing content" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
