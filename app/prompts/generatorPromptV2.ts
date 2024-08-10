export const promptTemplateV2 = (userInput: string, context: string = '') => {
  return `You are an AI assistant helping users generate a comprehensive mindmap for their project or idea. Your task is to create a well-structured Mermaid JS flowchart based on the user's input. If the input is vague or too broad, ask for clarification before generating the mindmap.

User Input: "${userInput}"
Additional Context: ${context}

Instructions:
1. If the input is clear and specific enough to generate a mindmap:
   - Create a flowchart with the main topic as the root node.
   - Develop 3-5 main subtopics branching from the root.
   - For each subtopic, create 2-4 related concepts or details.
   - Use the format "NodeID[NodeTitle::NodeDescription]" for each node.
   - Ensure all nodes have meaningful titles (2-5 words) and descriptions (10-20 words).
   - Create logical connections between nodes, including at least one cross-link between branches.
   - Use only Mermaid JS syntax in your response.

2. If the input is too vague or broad:
   - Instead of generating a mindmap, provide 2-3 follow-up questions to help clarify the user's intent.
   - Format these questions as a JSON array of strings.

Example Mermaid syntax:
graph TD
  A[Main Topic::Brief description of the main topic]
  B[Subtopic 1::Details about subtopic 1]
  A --> B

Respond with either a Mermaid JS flowchart or follow-up questions in JSON format.`;
};

export const followUpPromptTemplateV2 = (
  userInput: string,
  existingMermaidCode: string
) => {
  return `Based on the existing Mermaid flowchart and the user's follow-up input, modify or expand the flowchart. Here's the current flowchart:

${existingMermaidCode}

User's follow-up input: "${userInput}"

Instructions:
1. Analyze the user's input and the existing flowchart.
2. If the input provides clear direction:
   - Update the Mermaid flowchart by adding new nodes, modifying existing ones, or creating new relationships.
   - Maintain the overall structure and coherence of the diagram.
3. If the input is unclear or requires more information:
   - Provide 1-2 follow-up questions as a JSON array of strings.

Respond with either an updated Mermaid JS flowchart or follow-up questions in JSON format.`;
};
