import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { prompt } = req.body;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that generates creative ideas based on given prompts.",
          },
          {
            role: "user",
            content: `Generate a creative idea based on the following prompt:\n${prompt}`,
          },
        ],
        max_tokens: 100,
        n: 1,
        stop: null,
        temperature: 0.7,
      });

      let generatedIdea = "";

      if (response.choices[0]?.message?.content) {
        generatedIdea = response.choices[0].message.content.trim();
      }

      res.status(200).json({ idea: generatedIdea });
    } catch (error) {
      console.error("Error generating idea:", error);
      res.status(500).json({ error: "Error generating idea" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
