import React from "react";
import withAuth from "../components/auth/withAuth";
import Layout from "../components/layout/layout";
import SettingsPanel from "../components/settings/SettingsPanel";

const Settings: React.FC = () => {
  return (
    <Layout>
      <SettingsPanel />
    </Layout>
  );
};

export default withAuth(Settings);
