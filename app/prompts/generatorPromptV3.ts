export const promptTemplateV3 = (userInput: string) => {
  const [topic, projectDetails] = userInput.split('\nProject Details: ');

  return `Generate a comprehensive Mermaid JS flowchart for the MindPlexa project management platform based on the following input:

Main Topic: ${topic}
Additional Context: ${projectDetails}

Instructions:
1. Create a flowchart that starts with the main topic as the root node.
2. Develop a logical structure with 3-7 main subtopics branching out from the root.
3. For each main subtopic, create 2-5 child nodes with relevant details.
4. Each node should follow the format: "NodeID[NodeTitle::NodeDescription]"
   - NodeTitle should be a concise key point (max 5 words)
   - NodeDescription should provide more details or elaboration (15-25 words)
5. Ensure all nodes, including the root node, have meaningful titles and descriptions.
6. Create coherent connections between nodes that make sense for the topic.
7. Avoid using any special characters or double quotes in the node text.
8. Use varied relationships: some nodes may have multiple children, while others may have none.
9. Consider the project's complexity and structure when creating the hierarchy.
10. Only include Mermaid JS syntax in your response, no additional text.

Generate a detailed and well-structured Mermaid JS flowchart now:`;
};
