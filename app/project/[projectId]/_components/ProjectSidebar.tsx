import React from "react";
import { FaTasks, FaLightbulb, FaComments, FaHistory } from "react-icons/fa";

interface ProjectSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  activeView,
  onViewChange,
}) => {
  return (
    <div className="project-sidebar">
      <div
        className={`sidebar-item ${activeView === "canvas" ? "active" : ""}`}
        onClick={() => onViewChange("canvas")}
      >
        <FaTasks /> Canvas
      </div>
      <div
        className={`sidebar-item ${activeView === "ideas" ? "active" : ""}`}
        onClick={() => onViewChange("ideas")}
      >
        <FaLightbulb /> Ideas
      </div>
      <div
        className={`sidebar-item ${activeView === "comments" ? "active" : ""}`}
        onClick={() => onViewChange("comments")}
      >
        <FaComments /> Comments
      </div>
      <div
        className={`sidebar-item ${activeView === "history" ? "active" : ""}`}
        onClick={() => onViewChange("history")}
      >
        <FaHistory /> History
      </div>
    </div>
  );
};

export default ProjectSidebar;
