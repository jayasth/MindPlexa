// src/components/AgentLibrary.tsx

import React from "react";
import AgentCard from "./AgentCard";
import agents from "../data/agents"; // Import the agents data

const AgentLibrary: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          title={agent.title}
          description={agent.description}
          link={agent.link}
        />
      ))}
    </div>
  );
};

export default AgentLibrary;
