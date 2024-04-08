import React from "react";
import { FaFileExport, FaFileImport } from "react-icons/fa";
import { Node, Edge } from "reactflow";

interface ExportImportProps {
  projectId: string;
  nodes: Node[];
  edges: Edge[];
  onImport: (nodes: Node[], edges: Edge[]) => void;
}

const ExportImport: React.FC<ExportImportProps> = ({
  projectId,
  nodes,
  edges,
  onImport,
}) => {
  const handleExport = () => {
    const projectData = {
      projectId,
      nodes,
      edges,
    };
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `project-${projectId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonString = e.target?.result as string;
        const projectData = JSON.parse(jsonString);
        onImport(projectData.nodes, projectData.edges);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="export-import">
      <button onClick={handleExport}>
        <FaFileExport /> Export
      </button>
      <label htmlFor="import-input">
        <FaFileImport /> Import
      </label>
      <input
        id="import-input"
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: "none" }}
      />
    </div>
  );
};

export default ExportImport;
