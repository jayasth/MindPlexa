import React from "react";
import withAuth from "../components/auth/withAuth";
import Layout from "../components/layout/layout";
import AccountSettings from "../components/profile/ProfileSettings";

const AccountSettingsPage: React.FC = () => {
  return (
    <Layout>
      <AccountSettings />
    </Layout>
  );
};

export default withAuth(AccountSettingsPage);
