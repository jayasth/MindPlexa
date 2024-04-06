import React from "react";
import withAuth from "../client/src/components/auth/withAuth";
import Layout from "../client/src/components/layout/layout";
import SettingsPanel from "../client/src/components/settings/SettingsPanel";

const Settings: React.FC = () => {
  return (
    <Layout>
      <SettingsPanel />
    </Layout>
  );
};

export default withAuth(Settings);
