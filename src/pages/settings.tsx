// src/pages/settings.tsx

import React from "react";
import Layout from "../components/layout";
import SettingsPanel from "../components/Settings/SettingsPanel";

const Settings: React.FC = () => {
  return (
    <Layout>
      <div>
        <h1 className="text-3xl font-heading mb-4">Settings</h1>
        <SettingsPanel />
      </div>
    </Layout>
  );
};

export default Settings;
