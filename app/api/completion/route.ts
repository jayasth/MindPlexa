import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';
import { promptTemplate } from '@/app/prompts/generatorPrompt';
import { promptTemplateV1 } from '@/app/prompts/generatorPromptV1';
import { promptTemplateV2 } from '@/app/prompts/generatorPromptV2';

const modelConfig = {
  default: 'claude-3-5-sonnet-20240620',
  v1: 'claude-3-5-sonnet-20240620',
  v2: 'claude-3-5-sonnet-20240620'
};

export async function POST(req: Request) {
  try {
    const { prompt, version, existingMermaidCode, followUpQuestion, model } =
      await req.json();
    console.log('Prompt sent to Claude:', prompt);
    console.log('Version:', version);

    const selectedPromptTemplate =
      {
        v2: promptTemplateV2,
        v1: promptTemplateV1,
        default: promptTemplate
      }[version] || promptTemplate;

    const selectedModel = model || modelConfig[version] || modelConfig.default;

    const response = await generateText({
      model: anthropic(selectedModel),
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

    const content = response.text;
    if (!content) {
      throw new Error('Claude returned empty content');
    }

    console.log('Complete response from Claude:', content);

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
