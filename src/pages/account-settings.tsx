import React from "react";
import withAuth from "../components/withAuth";
import Layout from "../components/Layout/layout";
import AccountSettings from "../components/AccountSettings";

const AccountSettingsPage: React.FC = () => {
  return (
    <Layout>
      <AccountSettings />
    </Layout>
  );
};

export default withAuth(AccountSettingsPage);
