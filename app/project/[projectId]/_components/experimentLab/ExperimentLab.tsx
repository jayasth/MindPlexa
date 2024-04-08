import React, { useState } from "react";
import axios from "axios";
import { FaFlask } from "react-icons/fa";

interface ExperimentLabProps {
  projectId: string;
}

const ExperimentLab: React.FC<ExperimentLabProps> = ({ projectId }) => {
  const [idea, setIdea] = useState("");
  const [brainstormingResults, setBrainstormingResults] = useState<string[]>(
    []
  );

  const handleIdeaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIdea(event.target.value);
  };

  const handleBrainstorm = async () => {
    try {
      const response = await axios.post("/api/ai/brainstorm", {
        projectId,
        idea,
      });
      const { ideas } = response.data;
      setBrainstormingResults(ideas);
      setIdea("");
    } catch (error) {
      console.error("Error brainstorming ideas:", error);
    }
  };

  const handleAddIdea = async (generatedIdea: string) => {
    try {
      await axios.post("/api/ideas", { projectId, content: generatedIdea });
      setBrainstormingResults([]);
    } catch (error) {
      console.error("Error adding idea:", error);
    }
  };

  return (
    <div className="experiment-lab">
      <h3>
        <FaFlask /> Experiment Lab
      </h3>
      <div className="brainstorming-input">
        <textarea
          value={idea}
          onChange={handleIdeaChange}
          placeholder="Enter an idea or topic to brainstorm..."
        />
        <button onClick={handleBrainstorm}>Brainstorm</button>
      </div>
      <div className="brainstorming-results">
        {brainstormingResults.map((result, index) => (
          <div key={index} className="result-item">
            <p>{result}</p>
            <button onClick={() => handleAddIdea(result)}>Add as Idea</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperimentLab;
