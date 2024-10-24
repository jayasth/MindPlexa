import OpenAI from 'openai';
import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { promptTemplate } from '@/app/prompts/generatorPrompt';
import { promptTemplateV1 } from '@/app/prompts/generatorPromptV1';
import { promptTemplateV2 } from '@/app/prompts/generatorPromptV2';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

const GPT_MODEL = 'gpt-4o';

export const config = {
  runtime: 'edge',
  maxDuration: 60
};

export async function POST(req: Request) {
  try {
    const { prompt, version, existingMermaidCode, followUpQuestion, model } =
      await req.json();
    console.log('Prompt sent to AI:', prompt);
    console.log('Version:', version);
    console.log('Selected Model:', model);

    const selectedPromptTemplate =
      {
        v2: promptTemplateV2,
        v1: promptTemplateV1,
        default: promptTemplate
      }[version] || promptTemplate;

    let content;

    if (model === GPT_MODEL) {
      const response = await openai.chat.completions.create({
        model: GPT_MODEL,
        messages: [
          {
            role: 'user',
            content: selectedPromptTemplate(
              prompt,
              existingMermaidCode,
              followUpQuestion
            )
          }
        ],
        temperature: 0.1
      });
      content = response.choices[0].message.content;
    } else {
      const response = await generateText({
        model: anthropic(model),
        messages: [
          {
            role: 'user',
            content: selectedPromptTemplate(
              prompt,
              existingMermaidCode,
              followUpQuestion
            )
          }
        ],
        temperature: 0.1
      });
      content = response.text;
    }

    if (!content) {
      throw new Error('AI returned empty content');
    }

    console.log('Complete response from AI:', content);

    let parsedData;

    try {
      // First, try to parse the response as-is
      parsedData = JSON.parse(content);
    } catch (error) {
      // If parsing fails, try to extract JSON from a code block
      const match = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (match) {
        parsedData = JSON.parse(match[1]);
      } else {
        throw new Error('Unable to parse response');
      }
    }

    // Ensure the response is properly formatted
    return NextResponse.json(parsedData);
  } catch (error) {
    console.error('Detailed error in API route:', error);
    return NextResponse.json(
      {
        error: 'Error processing your request',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
