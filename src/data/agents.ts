// src/data/agents.ts

export interface Agent {
  id: number;
  title: string;
  description: string;
  link: string;
}

const agents: Agent[] = [
  {
    id: 1,
    title: "Text to Mindmap",
    description: "Generate mind maps from text input",
    link: "/agents/TextToMindmap",
  },
  {
    id: 2,
    title: "Vision Board",
    description: "Create and customize vision boards",
    link: "/agents/VisionBoard",
  },
  {
    id: 3,
    title: "Text to Flowchart",
    description: "Generate flowcharts from text input",
    link: "/agents/TextToFlowChart",
  },
  // ...other agents
];

export default agents;
