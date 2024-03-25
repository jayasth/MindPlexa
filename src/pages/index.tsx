import React from "react";
import Layout from "../components/layout";
import AgentCard from "../components/AgentCard";
import agents from "../data/agents";

const Home: React.FC = () => {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to MindPlexa!</h1>
        <p className="text-xl mb-12">
          Explore our collection of AI-powered agents to boost your
          productivity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              title={agent.title}
              description={agent.description}
              link={agent.link}
              className="card"
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
