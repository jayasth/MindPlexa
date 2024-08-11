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
  const { prompt, version } = await req.json();
  console.log('Prompt sent to OpenAI:', prompt);
  console.log('Version:', version);

  const selectedPromptTemplate =
    {
      v2: promptTemplateV2,
      v1: promptTemplateV1,
      default: promptTemplate
    }[version] || promptTemplate;

  const selectedModel = modelConfig[version] || modelConfig.default;

  try {
    const response = await openai.chat.completions.create({
      model: selectedModel,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: selectedPromptTemplate(prompt)
        }
      ]
    });

    const content = response.choices[0].message.content;
    console.log('Complete response from OpenAI:', content);

    if (version === 'v2') {
      try {
        const parsedContent = JSON.parse(content || '{}');
        return new Response(JSON.stringify(parsedContent), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (parseError) {
        console.error('Error parsing V2 response:', parseError);
        return new Response(
          JSON.stringify({ error: 'Error processing AI response' }),
          { status: 500 }
        );
      }
    } else {
      // For other versions, return the content as mermaidCode
      return new Response(JSON.stringify({ mermaidCode: content }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Error from OpenAI:', error);
    return new Response(
      JSON.stringify({ error: 'Error processing your request' }),
      { status: 500 }
    );
  }
}
