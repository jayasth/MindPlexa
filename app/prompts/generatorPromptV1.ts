export const promptTemplateV1 = (userInput: string) => {
  return `Analyze the following topic for a project management platform: "${userInput}"

1. Determine the most likely project type (e.g., writing, filmmaking, business planning, education, research, etc.).
2. Estimate the project size (small, medium, large) based on the complexity of the topic.
3. Suggest the most appropriate diagram structure (e.g., hierarchical, mindmap, network, timeline, etc.) for this topic.
4. Generate a Mermaid JS flowchart based on your analysis. The flowchart should:
   - Start with the main topic as the root node
   - Branch out into relevant subtopics and details
   - Use the format "NodeID[NodeTitle::NodeDescription]" for each node
   - Ensure coherent connections between nodes
   - Avoid special characters or double quotes in node text
   - Only include Mermaid syntax, no additional text

5. Provide a brief explanation of why you chose this structure and how it fits the topic.

Response format:
Project Type: [Your determined project type]
Project Size: [Your estimated project size]
Diagram Structure: [Your suggested diagram structure]
Explanation: [Your brief explanation]

Mermaid Flowchart:
[Your generated Mermaid flowchart]`;
};
