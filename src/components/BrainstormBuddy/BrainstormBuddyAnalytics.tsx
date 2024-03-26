import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line, Pie } from "react-chartjs-2";

const BrainstormBuddyAnalytics: React.FC = () => {
  const [sessionData, setSessionData] = useState<any>(null);
  const [ideaData, setIdeaData] = useState<any>(null);
  const [collaborationData, setCollaborationData] = useState<any>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const sessionResponse = await axios.get("/api/analytics/sessions");
      setSessionData(sessionResponse.data);

      const ideaResponse = await axios.get("/api/analytics/ideas");
      setIdeaData(ideaResponse.data);

      const collaborationResponse = await axios.get(
        "/api/analytics/collaboration"
      );
      setCollaborationData(collaborationResponse.data);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  return (
    <div className="brainstorm-buddy-analytics">
      <h2 className="text-2xl font-bold mb-4">BrainstormBuddy Analytics</h2>
      {/* Render analytics charts */}
      {sessionData && (
        <div>
          <h3>Session Analytics</h3>
          <Bar data={sessionData.sessionsOverTime} />
          <Pie data={sessionData.sessionsByType} />
        </div>
      )}
      {ideaData && (
        <div>
          <h3>Idea Analytics</h3>
          <Line data={ideaData.ideasOverTime} />
          <Bar data={ideaData.ideasByCategory} />
        </div>
      )}
      {collaborationData && (
        <div>
          <h3>Collaboration Analytics</h3>
          <Bar data={collaborationData.participantEngagement} />
          <Pie data={collaborationData.collaborationModes} />
        </div>
      )}
    </div>
  );
};

export default BrainstormBuddyAnalytics;
