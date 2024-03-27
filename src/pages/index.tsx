// src/pages/index.tsx

import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Layout from "../components/layout";
import AgentCard from "../components/AgentCard";
import agents from "../data/agents";
import OnboardingTutorial from "../components/Onboarding/OnboardingTutorial";

const Home: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error getting session:", error);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <OnboardingTutorial />;
  }

  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-heading mb-8">Welcome to MindPlexa!</h1>
        <p className="text-xl mb-12">
          Explore our collection of AI-powered agents to boost your
          productivity.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents
            .filter((agent) => agent.id <= 3)
            .map((agent) => (
              <AgentCard
                key={agent.id}
                title={agent.title}
                description={agent.description}
                link={agent.link}
                className="feature-card"
              />
            ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
