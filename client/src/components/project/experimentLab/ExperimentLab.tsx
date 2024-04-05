import React, { useState } from "react";

interface ExperimentLabProps {
  // Add any necessary props
}

const ExperimentLab: React.FC<ExperimentLabProps> = () => {
  const [ideas, setIdeas] = useState<string[]>([]);

  const handleAddIdea = (idea: string) => {
    setIdeas([...ideas, idea]);
  };

  return (
    <div className="experiment-lab">
      <h3>Experiment Lab</h3>
      <div className="idea-input">
        <input type="text" placeholder="Enter an idea" />
        <button onClick={() => handleAddIdea("New Idea")}>Add Idea</button>
      </div>
      <div className="idea-list">
        <h4>Ideas:</h4>
        <ul>
          {ideas.map((idea, index) => (
            <li key={index}>{idea}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ExperimentLab;
