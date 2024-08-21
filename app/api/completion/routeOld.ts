import OpenAI from 'openai';
import { promptTemplate } from '@/app/prompts/generatorPrompt';
import { promptTemplateV1 } from '@/app/prompts/generatorPromptV1';
import { promptTemplateV2 } from '@/app/prompts/generatorPromptV2';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
});

const modelConfig = {
  default: 'gpt-4o-mini',
  v1: 'gpt-4o-mini',
  v2: 'gpt-4o-mini'
};

export async function POST(req: Request) {
  try {
    const { prompt, version, existingMermaidCode, followUpQuestion, model } =
      await req.json();
    console.log('Prompt sent to OpenAI:', prompt);
    console.log('Version:', version);

    const selectedPromptTemplate =
      {
        v2: promptTemplateV2,
        v1: promptTemplateV1,
        default: promptTemplate
      }[version] || promptTemplate;

    const selectedModel = model || modelConfig[version] || modelConfig.default;

    const response = await openai.chat.completions.create({
      model: selectedModel,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: selectedPromptTemplate(
            prompt,
            existingMermaidCode,
            followUpQuestion
          )
        }
      ]
    });

    const content = response.choices[0].message.content;
    if (content === null) {
      throw new Error('OpenAI returned null content');
    }

    console.log('Complete response from OpenAI:', content);

    let parsedResponse;
    if (version === 'v2' || version === 'v1') {
      try {
        parsedResponse = JSON.parse(content);
      } catch (error) {
        console.error(`Error parsing ${version} response:`, error);
        parsedResponse = { needsFollowUp: false, mermaidCode: content };
      }
    } else {
      parsedResponse = { needsFollowUp: false, mermaidCode: content };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Detailed error in API route:', error);
    return new Response(
      JSON.stringify({
        error: 'Error processing your request',
        details: error instanceof Error ? error.message : String(error)
      }),
      { status: 500 }
    );
  }
}
