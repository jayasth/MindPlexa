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
    title: "BrainstormBuddy",
    description:
      "An AI-powered brainstorming tool that engages users in a Q&A-style conversation.",
    link: "/agents/BrainstormBuddy",
  },
  {
    id: 3,
    title: "Idea Vault",
    description: "Under construciton..",
    link: "/agents/IdeaVault",
  },
];

export default agents;
