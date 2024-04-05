import React, { useEffect, useState } from "react";
import { supabase } from "../services/api/supabase/supabaseClient";
import Layout from "../components/layout/layout";
import OnboardingTutorial from "../components/onboarding/Tutorial";
import Link from "next/link";

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
    return (
      <Layout>
        <div className="text-center">
          <h1 className="text-4xl font-heading mb-8">MindPlexa</h1>
          <p className="text-xl mb-12">
            Navigating Ideas from Conception to Completion!
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup">
              <span className="btn-primary">Sign Up</span>
            </Link>
            <Link href="/login">
              <span className="btn-secondary">Log In</span>
            </Link>
          </div>
        </div>
        <OnboardingTutorial />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-4xl font-heading mb-8">
          MindPlexa: Navigating Ideas from Conception to Completion
        </h1>
        <p className="text-xl mb-12">
          Start organizing your ideas and projects in one place with MindPlexa
          Workspace.
        </p>
        <Link href="/workspace">
          <span className="btn-secondary">Workspace</span>
        </Link>
      </div>
    </Layout>
  );
};

export default Home;
