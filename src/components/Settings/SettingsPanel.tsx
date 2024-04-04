import React from "react";
import NotificationSettings from "./NotificationSettings";
import IntegrationSettings from "./IntegrationSettings";
import ThemeCustomization from "./ThemeCustomization";

const SettingsPanel: React.FC = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="space-y-8">
        <NotificationSettings />
        <IntegrationSettings />
        <ThemeCustomization />
      </div>
    </div>
  );
};

export default SettingsPanel;
