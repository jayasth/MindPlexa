import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

interface ProjectInsightsProps {
  projectId: string;
}

const ProjectInsights: React.FC<ProjectInsightsProps> = ({ projectId }) => {
  // Sample data for demonstration purposes
  const nodeCountData = {
    labels: ["Ideas", "Tasks", "Resources"],
    datasets: [
      {
        label: "Node Count",
        data: [10, 5, 8],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const taskStatusData = {
    labels: ["To Do", "In Progress", "Done"],
    datasets: [
      {
        label: "Task Status",
        data: [3, 2, 5],
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  const ideaTrendData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Ideas Generated",
        data: [2, 5, 3, 7],
        fill: false,
        borderColor: "#FF6384",
      },
    ],
  };

  return (
    <div className="project-insights">
      <h4>Project Insights</h4>
      <div className="chart-container">
        <div className="chart-item">
          <h5>Node Count</h5>
          <Pie data={nodeCountData} />
        </div>
        <div className="chart-item">
          <h5>Task Status</h5>
          <Bar data={taskStatusData} />
        </div>
        <div className="chart-item">
          <h5>Idea Trend</h5>
          <Line data={ideaTrendData} />
        </div>
      </div>
    </div>
  );
};

export default ProjectInsights;
