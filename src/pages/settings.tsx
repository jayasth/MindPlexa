// src/pages/settings.tsx
import React from "react";
import withAuth from "../components/withAuth";
import Layout from "../components/layout";
import SettingsPanel from "../components/Settings/SettingsPanel";

const Settings: React.FC = () => {
  return (
    <Layout>
      <SettingsPanel />
    </Layout>
  );
};

export default withAuth(Settings);
