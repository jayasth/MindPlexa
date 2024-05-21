export const promptTemplate = (userInput: string) => {
  return `Generate a Mermaid JS flowchart for the topic: "${userInput}". 
Use the following format for each node: "NodeID[NodeTitle]". 
Ensure the output is valid Mermaid syntax and does not include any special characters or double quotes within the node titles.
All nodes should have the default type "note".
Ensure the diagram is well-structured, well branched depending on the input topic and well balanced.`;
};
