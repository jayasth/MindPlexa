export const promptTemplateV2 = (userInput: string) => {
  return `Analyze the following project concept for MindePlexa, an AI-powered project management platform:

"${userInput}"

Your task is to:
1. Determine the primary industry or domain of the project.
2. Assess the complexity and scale of the project.
3. Identify key themes or components of the project.
4. Suggest the most appropriate layout from the following options, considering the project's nature:
   - mindmap: For brainstorming sessions or projects with a central concept and branching ideas.
   - workflow: For processes with clear sequential steps or flows.
   - concept-map: For complex networks with many interconnected ideas.
   - grid: For organized, structured projects with equal emphasis on components.
   - hierarchical: For projects with clear parent-child relationships or organizational structures.

5. Generate a Mermaid JS flowchart representing the project structure, using the suggested layout as a guide.

Follow these guidelines for the Mermaid flowchart:
- Start with the main project concept as the root node.
- Create 3-7 main subtopics branching from the root.
- For each subtopic, add 2-5 child nodes with relevant details.
- Use the format: "nodeID[Node Title::Node Description]" for each node.
- Ensure all nodes have meaningful titles (max 5 words) and descriptions (15-50 words).
- Create logical connections between nodes using "nodeID1 --> nodeID2".
- Avoid special characters or quotes in node text.
- Start the Mermaid code with "graph TD".
- Ensure each node has a unique ID, preferably in the format 'n1', 'n2', etc.
- Make sure all edges reference existing node IDs.

Provide your response in the following JSON format:

{
  "analysis": {
    "industry": "string",
    "complexity": "low | medium | high",
    "keyThemes": ["string", "string", "..."],
    "suggestedLayout": "mindmap | workflow | concept-map | grid | hierarchical",
    "layoutReasoning": "string"
  },
  "mermaidCode": "string (Mermaid JS flowchart code)"
}

Ensure that the entire response is a valid JSON object, with the mermaidCode as a string value within the JSON structure.`;
};
