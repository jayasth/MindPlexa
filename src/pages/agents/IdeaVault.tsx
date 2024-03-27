// src/pages/agents/IdeaVault.tsx

import React from "react";
import Layout from "../../components/layout";
import IdeaVaultList from "../../components/IdeaVault/IdeaVaultList";

const IdeaVault: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-heading mb-4">Idea Vault</h1>
        <IdeaVaultList />
      </div>
    </Layout>
  );
};

export default IdeaVault;
