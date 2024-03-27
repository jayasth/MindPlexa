// src/pages/agents/IdeaVault.tsx
import React from "react";
import Layout from "../../components/layout";
import IdeaVaultManager from "../../components/IdeaVault/IdeaVaultManager";

const IdeaVault: React.FC = () => {
  return (
    <Layout>
      <IdeaVaultManager />
    </Layout>
  );
};

export default IdeaVault;
