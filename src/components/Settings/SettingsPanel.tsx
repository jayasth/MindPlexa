// src/components/Settings/SettingsPanel.tsx
import React, { useState } from "react";
import { FiCheck } from "react-icons/fi";

const SettingsPanel: React.FC = () => {
  const [theme, setTheme] = useState("light");

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    // TODO: Apply the selected theme to the app
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Settings</h2>
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Theme</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => handleThemeChange("light")}
            className={`px-4 py-2 rounded ${
              theme === "light"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {theme === "light" && <FiCheck className="inline-block mr-2" />}
            Light
          </button>
          <button
            onClick={() => handleThemeChange("dark")}
            className={`px-4 py-2 rounded ${
              theme === "dark"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {theme === "dark" && <FiCheck className="inline-block mr-2" />}
            Dark
          </button>
        </div>
      </div>
      {/* TODO: Add more customization options */}
    </div>
  );
};

export default SettingsPanel;
