import React from "react";
import Layout from "../../components/layout";
import BrainstormBuddySessionCreator from "../../components/BrainstormBuddy/BrainstormBuddySessionCreator";
import BrainstormBuddyAnalytics from "../../components/BrainstormBuddy/BrainstormBuddyAnalytics";

const BrainstormBuddy: React.FC = () => {
  return (
    <Layout>
      <div className="brainstorm-buddy-page">
        <h1 className="text-3xl font-bold mb-4">BrainstormBuddy</h1>
        <BrainstormBuddySessionCreator />
        <BrainstormBuddyAnalytics />
      </div>
    </Layout>
  );
};

export default BrainstormBuddy;
