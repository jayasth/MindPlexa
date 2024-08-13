export const promptTemplateV4 = (userInput: string) => {
  return `As an AI assistant, create a comprehensive project layout for the MindePlexa project management platform based on this user input: "${userInput}"

Follow these guidelines:

1. Analyze the input thoroughly to determine if it provides sufficient information for generating a project layout.
2. If the input is clear and detailed enough, create a Mermaid JS flowchart representing the project structure.
3. If the input lacks clarity or details, formulate a follow-up question to gather more information.

When generating the flowchart:
- Begin with the main topic as the root node.
- Create 3-7 main subtopics branching from the root.
- For each subtopic, add 2-5 child nodes with relevant details.
- Use the format: "nodeID[Node Title::Node Description]" for each node.
- Ensure all nodes have meaningful titles (max 5 words) and descriptions (15-25 words).
- Create logical connections between nodes using "nodeID1 --> nodeID2".
- Avoid special characters or quotes in node text.
- Start the Mermaid code with "graph TD".

Your response should be a JSON object with these fields:
{
  "needsFollowUp": boolean,
  "followUpQuestion": string (if needsFollowUp is true),
  "mermaidCode": string (if needsFollowUp is false),
  "nodeCount": number (if needsFollowUp is false),
  "edgeCount": number (if needsFollowUp is false)
}

Ensure that:
1. The Mermaid code is valid and can be parsed without errors.
2. Node IDs are unique and consistent throughout the diagram.
3. All edges reference existing node IDs.
4. The node count matches the number of defined nodes.
5. The edge count matches the number of connections.
6. There are no extraneous characters or text outside of the JSON structure.

Now, please analyze the input and provide the appropriate response.`;
};
