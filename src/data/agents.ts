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
    title: "IdeaMapper",
    description:
      "An AI-driven mind mapping tool that generates related words and phrases based on user input.",
    link: "/agents/IdeaMapper",
  },
  {
    id: 2,
    title: "SummaryScribe",
    description:
      "Allows users to input text and generates concise, well-structured summaries.",
    link: "/agents/SummaryScribe",
  },
  {
    id: 3,
    title: "BrainstormBuddy",
    description:
      "An AI-powered brainstorming tool that engages users in a Q&A-style conversation.",
    link: "/agents/BrainstormBuddy",
  },
  {
    id: 4,
    title: "KnowledgeKindle",
    description:
      "A curated selection of AI-generated content that users can explore and save.",
    link: "/agents/KnowledgeKindle",
  },
];

export default agents;
