// src/pages/agents/BrainstormBuddy.tsx

import React from "react";
import Layout from "../../components/layout";
import BrainstormBuddySessionCreator from "../../features/BrainstormBuddy/components/BrainstormBuddySessionCreator";
import BrainstormBuddySession from "../../features/BrainstormBuddy/components/BrainstormBuddySession";

const BrainstormBuddy: React.FC = () => {
  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-4">BrainstormBuddy</h1>
        <BrainstormBuddySessionCreator />
        <BrainstormBuddySession />
      </div>
    </Layout>
  );
};

export default BrainstormBuddy;
