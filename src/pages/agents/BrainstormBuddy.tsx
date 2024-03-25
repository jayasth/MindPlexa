// src/pages/agents/BrainstormBuddy.tsx

import React from "react";
import Layout from "../../components/layout";
import BrainstormBuddyChat from "../../components/BrainstormBuddy/BrainstormBuddyChat";

const BrainstormBuddy: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-heading mb-4">BrainstormBuddy</h1>
        <BrainstormBuddyChat />
      </div>
    </Layout>
  );
};

export default BrainstormBuddy;
