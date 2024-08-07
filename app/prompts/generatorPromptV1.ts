export const promptTemplateV1 = (userInput: string) => {
  return `Generate a Mermaid JS flowchart for a project management platform based on the following topic: "${userInput}"
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

Please generate the Mermaid flowchart now:`;
};
