export const promptTemplate = (userInput: string) => {
  return `graph TD;
Generate a Mermaid JS flowchart for the topic: ${userInput}. Each node should include a type in its label, like "Start ¡!startEvent!¡" or "Do something ¡!activity!¡". Ensure the output is valid Mermaid syntax.`;
};
