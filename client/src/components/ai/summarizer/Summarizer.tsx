import React, { useState } from "react";
import axios from "axios";
import { FaRobot } from "react-icons/fa";

interface SummarizerProps {
  nodeId: string;
  content: string;
  onSummarize: (summary: string) => void;
}

const Summarizer: React.FC<SummarizerProps> = ({
  nodeId,
  content,
  onSummarize,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    setLoading(true);

    try {
      const response = await axios.post("/api/ai/summarize", {
        nodeId,
        content,
      });
      const { summary } = response.data;
      onSummarize(summary);
    } catch (error) {
      console.error("Error summarizing content:", error);
    }

    setLoading(false);
  };

  return (
    <div className="summarizer">
      <button onClick={handleSummarize} disabled={loading}>
        <FaRobot className="summarizer-icon" />
        {loading ? "Summarizing..." : "Summarize"}
      </button>
    </div>
  );
};

export default Summarizer;
