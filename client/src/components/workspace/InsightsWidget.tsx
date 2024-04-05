import React, { useState, useEffect } from "react";
import { getUserInsights } from "../../services/api/workspace/insightsApi";

const InsightsWidget: React.FC = () => {
  const [insights, setInsights] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const insightsData = await getUserInsights();
        setInsights(insightsData);
      } catch (error) {
        console.error("Error fetching user insights:", error);
        setError("Failed to fetch insights.");
      }
    };

    fetchInsights();
  }, []);

  if (error) {
    return <div className="p-4 bg-red-100 text-red-800 rounded">{error}</div>;
  }

  if (!insights) {
    return <div>Loading insights...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-md shadow">
          <p className="text-gray-600 font-semibold">Total Ideas</p>
          <p className="text-3xl font-bold">{insights.totalIdeas}</p>
        </div>
        <div className="bg-white p-4 rounded-md shadow">
          <p className="text-gray-600 font-semibold">Brainstorming Sessions</p>
          <p className="text-3xl font-bold">{insights.brainstormingSessions}</p>
        </div>
      </div>
    </div>
  );
};

export default InsightsWidget;
