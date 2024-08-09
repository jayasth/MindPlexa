export const promptTemplateV1 = (userInput: string) => {
  const [topic, projectDetails] = userInput.split('\nProject Details: ');

  return `Generate a comprehensive Mermaid JS flowchart for the MindePlexa project management platform based on the following input:

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

Example structure (do not use this content, it's just for format reference):
graph TD
  A[Main Topic::Brief description of the main topic]
  B[Subtopic 1::Details about subtopic 1]
  C[Subtopic 2::Details about subtopic 2]
  D[Subtopic 3::Details about subtopic 3]
  A --> B
  A --> C
  A --> D
  B --> E[Sub-subtopic 1.1::More specific information]
  B --> F[Sub-subtopic 1.2::Additional details]
  C --> G[Sub-subtopic 2.1::Relevant information]
  D --> H[Sub-subtopic 3.1::Specific aspects]
  D --> I[Sub-subtopic 3.2::Further details]

Generate a detailed and well-structured Mermaid JS flowchart now:`;
};
