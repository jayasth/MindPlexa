export const promptTemplateV1 = (userInput: string) => {
  const [topic, projectDetails] = userInput.split('\nProject Details: ');

  return `Generate a comprehensive Mermaid JS flowchart for a project management platform based on the following input:

Main Topic: ${topic}
Additional Context: ${projectDetails}

Instructions:
1. Create a flowchart that starts with the main topic as the root node.
2. Develop a logical structure with subtopics and details branching out from the main topic.
3. Each node should follow the format: "NodeID[NodeTitle::NodeDescription]"
   - NodeTitle should be a concise key point
   - NodeDescription should provide more details or elaboration
4. Ensure all nodes, including the root node, have meaningful titles and descriptions.
5. Create coherent connections between nodes that make sense for the topic.
6. Avoid using any special characters or double quotes in the node text.
7. If a node doesn't require additional details, use "No description available" as the description.
8. Only include Mermaid JS syntax in your response, no additional text.

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
