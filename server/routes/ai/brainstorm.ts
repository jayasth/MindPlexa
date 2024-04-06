import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { projectId, idea } = req.body;

    try {
      const prompt = `Brainstorm ideas related to the following topic:\n${idea}`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that helps brainstorm ideas related to a given topic.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        n: 1,
        stop: null,
        temperature: 0.7,
      });

      const generatedIdeas =
        response.choices[0]?.message?.content?.trim() ??
        "No response provided.";

      res.status(200).json({ projectId, ideas: generatedIdeas });
    } catch (error) {
      console.error("Error brainstorming ideas:", error);
      res.status(500).json({ error: "Error brainstorming ideas" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
