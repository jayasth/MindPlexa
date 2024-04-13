import OpenAI from 'openai';
import { promptTemplate } from '@/app/prompts/prompt-2';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  try {
    const response: any = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      stream: true,
      temperature: 0.1,
      max_tokens: 300,
      prompt: promptTemplate(prompt)
    });

    const stream = response.data;
    const decoder = new TextDecoder();
    let result = '';

    for await (const chunk of stream) {
      const text = decoder.decode(chunk);
      result += text;
    }

    return new Response(JSON.stringify({ completion: result.trim() }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error generating completion:', error);
    return new Response('Error generating completion', { status: 500 });
  }
}
