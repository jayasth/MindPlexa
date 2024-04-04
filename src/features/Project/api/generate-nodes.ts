import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "openai";
import withAuth from "../../../components/withAuth";

const openai = new OpenAI({ apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY });

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { keyword } = req.body as { keyword: string };

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are an AI assistant that generates related keywords for a given topic.",
          },
          {
            role: "user",
            content: `Generate a list of related keywords for the following topic: ${keyword}`,
          },
        ],
        max_tokens: 100,
        n: 1,
        stop: null,
        temperature: 0.8,
      });

      // Updated line
      const generatedKeywords =
        response.choices[0].message?.content?.trim().split("\n") || [];
      const generatedNodes = generatedKeywords.map(
        (keyword: string, index: number) => ({
          id: `node-${index}`,
          type: "custom",
          data: { label: keyword },
          position: { x: 0, y: 0 },
        })
      );

      res.status(200).json(generatedNodes);
    } catch (error) {
      console.error("Error generating nodes:", error);
      res.status(500).json({ message: "Error generating nodes" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default withAuth(handler);
