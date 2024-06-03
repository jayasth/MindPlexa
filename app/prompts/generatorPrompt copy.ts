export const promptTemplate = (userInput: string) => {
  return `Generate a Mermaid JS flowchart for the topic: "${userInput}". 
Each node should have a unique title (subtopic of the user input) and a brief description for it, separated by a double colon (::).
Use the following format for each node: "NodeID[NodeTitle::NodeDescription]". 
Ensure the output is valid Mermaid syntax and does not include any special characters or double quotes within the node titles or descriptions.
All nodes should have the default type "note".
Ensure the diagram is well-structured, well-branched depending on the input topic, and well-balanced.
If a node does not have a description, use "No description available" as the default description.`;
};
