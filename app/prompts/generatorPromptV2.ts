export const promptTemplateV2 = (userInput: string) => {
  return `As an advanced AI assistant for MindPlexa, a cutting-edge project management platform, analyze the following project concept and create an optimized project network:

"${userInput}"

Your task is to:
1. Thoroughly analyze the project concept, identifying its core elements, scope, and potential challenges.
2. Determine the primary industry or domain of the project.
3. Assess the complexity and scale of the project.
4. Identify key themes, components, or phases of the project.
5. Generate a comprehensive Mermaid JS flowchart representing the project structure.
6. Suggest the most appropriate layout based on the project's nature and complexity.

When creating the Mermaid flowchart:
- Begin with the main project concept as the root node.
- Create 3-7 main subtopics or phases branching from the root.
- For each subtopic, add 2-5 child nodes with relevant details, tasks, or concepts.
- Use the format: "nodeID[Node Title::Node Description]" for each node.
- Ensure all nodes have concise, meaningful titles (max 5 words) and descriptions (15-50 words).
- Create logical connections between nodes using "nodeID1 --> nodeID2".
- Avoid special characters or quotes in node text.
- Start the Mermaid code with "graph TD".
- Assign unique IDs to each node, preferably in the format 'n1', 'n2', etc.
- Ensure all edges reference existing node IDs.

Consider these elements when structuring the project:
- Project lifecycle stages
- Key deliverables and milestones
- Critical tasks and subtasks
- Important concepts or methodologies
- Potential risks and mitigation strategies
- Required resources and tools
- Stakeholders and team roles
- Dependencies between tasks or components

Tailor the content to be highly relevant and actionable for project management, regardless of the specific field or industry.

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

Ensure that:
1. The analysis is insightful and accurately reflects the project's nature.
2. The suggested layout is the most suitable for the project structure.
3. The Mermaid code is valid, comprehensive, and can be parsed without errors.
4. Node IDs are unique and consistent throughout the diagram.
5. All edges reference existing node IDs.
6. The entire response is a valid JSON object, with the mermaidCode as a string value within the JSON structure.

Now, please analyze the project concept and provide a detailed, optimized project network.`;
};
