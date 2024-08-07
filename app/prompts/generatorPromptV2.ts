export const promptTemplateV2 = (userInput: string) => {
  return `Generate a Mermaid JS flowchart for a project management platform based on the following topic: "${userInput}"
The flowchart should:
- Start with the main topic as the root node
- Branch out into subtopics and details
- Use the format "NodeID[NodeType::NodeTitle::NodeDescription]" for each node
- Use appropriate NodeTypes: note, task, calendar, draw, or table
- Ensure coherent connections between nodes
- Avoid special characters or double quotes in node text
- Only include Mermaid syntax, no additional text

Example format:
graph TD
  A[task::Main Topic::Description]
  B[note::Subtopic 1::Details]
  C[calendar::Subtopic 2::More info]
  A --> B
  A --> C

Please generate the Mermaid flowchart now:`;
};
