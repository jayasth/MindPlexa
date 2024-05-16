export const promptTemplate = (userInput: string) => {
  return `Generate a Mermaid JS flowchart for the topic: ${userInput}. Start with 'graph TD;' to define a top-down directed graph. Each node should include a type in its label, like "Start ¡!startEvent!¡" or "Do something ¡!activity!¡". Ensure the output is valid Mermaid syntax.`;
};
