import OpenAI from 'openai';
import { promptTemplate } from '@/app/prompts/prompt-2';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { prompt } = await req.json();
  console.log('Prompt sent to OpenAI:', prompt);

  try {
    const response = await openai.completions.create({
      model: 'gpt-3.5-turbo-instruct',
      temperature: 0.1,
      max_tokens: 4000,
      prompt: promptTemplate(prompt)
    });

    console.log('Complete response from OpenAI:', response.choices[0].text);
    return new Response(
      JSON.stringify({ mermaidCode: response.choices[0].text }),
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error from OpenAI:', error);
    return new Response(
      JSON.stringify({ error: 'Error processing your request' }),
      { status: 500 }
    );
  }
}
