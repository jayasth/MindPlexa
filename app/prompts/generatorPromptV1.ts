export const promptTemplateV1 = (userInput: string) => {
  const [topic, projectDetails] = userInput.split('\nProject Details: ');

  return `Analyze the following project topic and details to generate an appropriate Mermaid JS flowchart:

Topic: ${topic}
Project Details: ${projectDetails}

Based on this information:
1. Determine the most suitable chart type (e.g., flowchart, mindmap, gantt, class diagram, etc.).
2. Identify the project type (e.g., writing, filmmaking, research, business planning, etc.).
3. Estimate the project size and complexity.
4. Generate a Mermaid JS diagram that best represents the project structure and workflow.

The flowchart should:
- Start with the main topic as the root node
- Branch out into subtopics and details
- Use the format "NodeID[NodeTitle::NodeDescription]" for each node
- Ensure coherent connections between nodes
- Avoid special characters or double quotes in node text
- Only include Mermaid syntax, no additional text

Example format:
graph TD
  A[Main Topic::Description]
  B[Subtopic 1::Details]
  C[Subtopic 2::More info]
  A --> B
  A --> C

Please generate the appropriate Mermaid diagram now:`;
};
