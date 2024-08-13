export const promptTemplateV4 = (userInput: string) => {
  return `As an AI assistant, create a detailed project layout for the MindePlexa project management platform based on the user input: "${userInput}"

Follow these guidelines:

1. **Input Analysis**: Assess the input to determine if it contains enough information to generate a project layout.
2. **Flowchart Generation**: 
   - If the input is clear, create a Mermaid JS flowchart that represents the project structure.
   - If the input is vague, ask a follow-up question to gather more details.

### Flowchart Guidelines:
- Start with the main topic as the root node.
- Create 3-7 main subtopics branching from the root.
- For each subtopic, add 2-5 child nodes with relevant details.
- Use the format: "nodeID[Node Title::Node Description]" for each node.
- Ensure all nodes have meaningful titles (max 5 words) and descriptions (15-25 words).
- Create logical connections between nodes using "nodeID1 --> nodeID2".
- Avoid special characters or quotes in node text.
- Begin the Mermaid code with "graph TD".
- Ensure each node has a unique ID, formatted as 'n1', 'n2', etc.
- Confirm that all edges reference existing node IDs.

### Response Format:
Your response should be a JSON object with the following fields:
{
  "needsFollowUp": boolean,
  "followUpQuestion": string (if needsFollowUp is true),
  "mermaidCode": string (if needsFollowUp is false)
}

### Validation Criteria:
1. The Mermaid code must be valid and parsable without errors.
2. Node IDs must be unique and consistent throughout the diagram.
3. All edges must reference existing node IDs.
4. No extraneous characters or text should be present outside the JSON structure.

Now, please analyze the input and provide the appropriate response.`;
};
