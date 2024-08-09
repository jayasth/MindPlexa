export const promptTemplateV2 = (userInput: string) => {
  return `You are an AI assistant helping users generate a Mermaid JS flowchart for a project management platform. 
  The diagram should:
- Have a logical structure with the central theme or user's input as the parent node, branching out into 3-5 main subtopics, each with 2-4 child nodes
- Strictly use the format "NodeID[NodeTitle::NodeDescription]" for each node, where the title is concise (2-5 words) and the description is informative (10-20 words)
- Ensure the parent node always has a meaningful title and description; the user can enter anything they want
- Connect nodes in a coherent flow that makes sense for the topic, using appropriate relationships (e.g., one-way arrows for hierarchical relationships, two-way arrows for interdependent relationships)
- Include at least one cross-link between branches to show interconnectedness
- Strictly avoid any special characters or double quotes in the node text that could break the Mermaid syntax
- Strictly avoid any other text than text for Mermaid syntax (not even preceding or trailing text to avoid errors on parsing)
- Use "No description" only if absolutely necessary
- Produce a well-formed, logical diagram to give the user a strong starting point for their project, encouraging further exploration and detailing

The user has entered the following topic or idea: "${userInput}"

Important: Start your response with "\`\`\`mermaid" on a new line and end it with "\`\`\`" on a new line. Do not include any text before or after the Mermaid code.
`;
};
