import React from "react";
import { FaPuzzlePiece } from "react-icons/fa";

interface IntegrationHubProps {
  projectId: string;
}

const IntegrationHub: React.FC<IntegrationHubProps> = ({ projectId }) => {
  const handleTrelloIntegration = () => {
    // Implement Trello integration logic
    console.log("Integrating with Trello");
  };

  const handleGitHubIntegration = () => {
    // Implement GitHub integration logic
    console.log("Integrating with GitHub");
  };

  const handleSlackIntegration = () => {
    // Implement Slack integration logic
    console.log("Integrating with Slack");
  };

  return (
    <div className="integration-hub">
      <h3>
        <FaPuzzlePiece /> Integration Hub
      </h3>
      <div className="integration-list">
        <div className="integration-item">
          <h4>Trello</h4>
          <p>Integrate with Trello for task management.</p>
          <button onClick={handleTrelloIntegration}>Integrate</button>
        </div>
        <div className="integration-item">
          <h4>GitHub</h4>
          <p>Integrate with GitHub for version control.</p>
          <button onClick={handleGitHubIntegration}>Integrate</button>
        </div>
        <div className="integration-item">
          <h4>Slack</h4>
          <p>Integrate with Slack for team communication.</p>
          <button onClick={handleSlackIntegration}>Integrate</button>
        </div>
      </div>
    </div>
  );
};

export default IntegrationHub;
