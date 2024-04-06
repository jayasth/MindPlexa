import React from "react";
import withAuth from "../client/src/components/auth/withAuth";
import Layout from "../client/src/components/layout/layout";
import AccountSettings from "../client/src/components/profile/ProfileSettings";

const AccountSettingsPage: React.FC = () => {
  return (
    <Layout>
      <AccountSettings />
    </Layout>
  );
};

export default withAuth(AccountSettingsPage);
