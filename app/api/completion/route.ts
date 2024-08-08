import OpenAI from 'openai';
import { promptTemplate } from '@/app/prompts/generatorPrompt';
import { promptTemplateV1 } from '@/app/prompts/generatorPromptV1';
import { promptTemplateV2 } from '@/app/prompts/generatorPromptV2';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

const modelConfig = {
  default: 'gpt-3.5-turbo',
  v1: 'gpt-4',
  v2: 'gpt-4'
};

export async function POST(req: Request) {
  const { topic, version } = await req.json();
  console.log('Topic sent to OpenAI:', topic);
  console.log('Version:', version);

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: promptTemplateV1(topic)
        }
      ]
    });

    const content: string | null = response.choices[0].message.content;
    if (!content) {
      throw new Error('Content is null');
    }
    const lines = content.split('\n');
    const projectType =
      lines
        .find((line) => line.startsWith('Project Type:'))
        ?.split(':')[1]
        .trim() || '';
    const projectSize =
      lines
        .find((line) => line.startsWith('Project Size:'))
        ?.split(':')[1]
        .trim() || '';
    const diagramStructure =
      lines
        .find((line) => line.startsWith('Diagram Structure:'))
        ?.split(':')[1]
        .trim() || '';
    const explanation =
      lines
        .find((line) => line.startsWith('Explanation:'))
        ?.split(':')[1]
        .trim() || '';
    const mermaidCode = content.split('Mermaid Flowchart:')[1].trim();

    return new Response(
      JSON.stringify({
        mermaidCode,
        projectType,
        projectSize,
        diagramStructure,
        explanation
      }),
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
