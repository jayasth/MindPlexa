import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaHistory } from "react-icons/fa";

interface HistoryProps {
  projectId: string;
}

const History: React.FC<HistoryProps> = ({ projectId }) => {
  const [history, setHistory] = useState<
    { id: string; timestamp: string; changes: string }[]
  >([]);

  useEffect(() => {
    fetchHistory();
  }, [projectId]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error("Error fetching project history:", error);
    }
  };

  const handleRevertVersion = async (versionId: string) => {
    try {
      await axios.post(`/api/projects/${projectId}/revert`, { versionId });
      // Refresh the project data after reverting to a previous version
      // You can emit a socket event to notify other clients about the version change
    } catch (error) {
      console.error("Error reverting project version:", error);
    }
  };

  return (
    <div className="history">
      <h4>
        <FaHistory /> Project History
      </h4>
      <div className="history-list">
        {history.map((version) => (
          <div key={version.id} className="history-item">
            <p>{version.timestamp}</p>
            <p>{version.changes}</p>
            <button onClick={() => handleRevertVersion(version.id)}>
              Revert
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
