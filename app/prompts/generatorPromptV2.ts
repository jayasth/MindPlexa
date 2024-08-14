export const projectAnalysisPrompt = (userInput: string) => {
  return `Analyze the following project concept for MindePlexa, an AI-powered project management platform:

"${userInput}"

Your task is to:
1. Determine the primary industry or domain of the project.
2. Assess the complexity and scale of the project.
3. Identify key themes or components of the project.
4. Suggest the most appropriate layout from the following options, considering the project's nature:
   - tree: For hierarchical structures or processes with clear parent-child relationships.
   - radial: For concepts with a central theme and related subtopics radiating outward.
   - force: For complex networks with many interconnected ideas.
   - mindmap: For brainstorming sessions or projects with a central concept and branching ideas.
   - timeline: For projects with a clear chronological order or sequential steps.
   - hybrid: Combine two layouts if the project has multiple aspects (e.g., "tree-timeline" or "radial-force").

Provide your analysis in the following JSON format:
{
  "industry": string,
  "complexity": "low" | "medium" | "high",
  "keyThemes": string[],
  "suggestedLayout": "tree" | "radial" | "force" | "mindmap" | "timeline" | "hybrid",
  "layoutReasoning": string,
  "hybridDetails": {
    "primaryLayout": string,
    "secondaryLayout": string,
    "reasoning": string
  }
}`;
};

export const layoutGenerationPrompt = (
  userInput: string,
  analysisResult: string
) => {
  return `Based on the following project concept and analysis for MindePlexa:

Project Concept: "${userInput}"

Analysis: ${analysisResult}

Generate a comprehensive Mermaid JS flowchart that represents the project structure. Follow these guidelines:

1. Use the suggested layout as a guide for the overall structure.
2. Start with the main project concept as the root node.
3. Create 3-7 main subtopics branching from the root, based on the key themes identified.
4. For each subtopic, add 2-5 child nodes with relevant details.
5. Use the format: "nodeID[Node Title::Node Description]" for each node.
6. Ensure all nodes have meaningful titles (max 5 words) and descriptions (15-25 words).
7. Create logical connections between nodes using "nodeID1 --> nodeID2".
8. Avoid special characters or quotes in node text.
9. Start the Mermaid code with "graph TD".
10. Ensure each node has a unique ID, preferably in the format 'n1', 'n2', etc.
11. Make sure all edges reference existing node IDs.

Provide your response in the following JSON format:
{
  "mermaidCode": string
}`;
};

export const promptTemplateV2 = (userInput: string) => {
  return `Analyze the following project concept for MindePlexa, an AI-powered project management platform:

"${userInput}"

Your task is to:
1. Determine the primary industry or domain of the project.
2. Assess the complexity and scale of the project.
3. Identify key themes or components of the project.
4. Suggest the most appropriate layout from the following options, considering the project's nature:
   - tree: For hierarchical structures or processes with clear parent-child relationships.
   - radial: For concepts with a central theme and related subtopics radiating outward.
   - force: For complex networks with many interconnected ideas.
   - mindmap: For brainstorming sessions or projects with a central concept and branching ideas.
   - timeline: For projects with a clear chronological order or sequential steps.
   - hybrid: Combine two layouts if the project has multiple aspects (e.g., "tree-timeline" or "radial-force").

5. Generate a Mermaid JS flowchart representing the project structure, using the suggested layout as a guide.

Follow these guidelines for the Mermaid flowchart:
- Start with the main project concept as the root node.
- Create 3-7 main subtopics branching from the root.
- For each subtopic, add 2-5 child nodes with relevant details.
- Use the format: "nodeID[Node Title::Node Description]" for each node.
- Ensure all nodes have meaningful titles (max 5 words) and descriptions (15-25 words).
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
    "suggestedLayout": "tree | radial | force | mindmap | timeline | hybrid",
    "layoutReasoning": "string",
    "hybridDetails": {
      "primaryLayout": "string",
      "secondaryLayout": "string",
      "reasoning": "string"
    }
  },
  "mermaidCode": "string (Mermaid JS flowchart code)"
}

Ensure that the entire response is a valid JSON object, with the mermaidCode as a string value within the JSON structure.`;
};
