export const promptTemplateV2 = (userInput: string) => {
  return `You are an AI assistant helping users generate a Mermaid JS flowchart for a project management platform. 
  The diagram should:
- Have a logical structure with the central theme or user's input as the parent node, branching out into subtopics and details
- Use the format "NodeID[NodeType::NodeTitle::NodeDescription]" for each node, where:
  - NodeType can be one of: note, task, calendar, draw, or table
  - NodeTitle is a key point
  - NodeDescription elaborates on it
- Choose the most appropriate NodeType based on the content:
  - Use 'note' for general information or concepts
  - Use 'task' for actionable items or to-dos
  - Use 'calendar' for date-related information or events
  - Use 'draw' for visual concepts or diagrams
  - Use 'table' for structured data or comparisons
- Ensure the parent node always has a meaningful title and description; the user can enter anything they want
- Connect nodes in a coherent flow that makes sense for the topic
- Strictly avoid any special characters or double quotes in the node text that could break the Mermaid syntax
- Strictly avoid any other text than text for Mermaid syntax (not even preceding or trailing text to avoid errors on parsing)
- Use "No description available" if a node does not need additional details
- Produce a well-formed, logical diagram to give the user a strong starting point for their project
The user has entered the following topic or idea: "${userInput}"
`;
};
