import OpenAI from 'openai';
import { promptTemplateV1 } from '@/app/prompts/generatorPromptV1';
import { promptTemplateV2 } from '@/app/prompts/generatorPromptV2';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

export async function POST(req: Request) {
  const { prompt, version } = await req.json();
  console.log('Prompt sent to OpenAI:', prompt);

  const promptTemplate = version === 'v1' ? promptTemplateV1 : promptTemplateV2;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
      messages: [{ role: 'user', content: promptTemplate(prompt) }]
    });

    console.log(
      'Complete response from OpenAI:',
      response.choices[0].message.content
    );
    return new Response(
      JSON.stringify({ mermaidCode: response.choices[0].message.content }),
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
