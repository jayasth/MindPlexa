// client/src/components/project/ProjectList.tsx
import React, { useState, useEffect } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import ProjectModal from "./ProjectModal";

interface Project {
  id: string;
  name: string;
  description: string;
}

const ProjectList: React.FC = () => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabaseClient
        .from("projects")
        .select("*")
        .eq("workspace_id", "YOUR_WORKSPACE_ID"); // Replace with the actual workspace ID

      if (error) {
        console.error("Error fetching projects:", error);
      } else {
        setProjects(data as Project[]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleCreateProject = async (name: string, description: string) => {
    try {
      const { data, error } = await supabaseClient
        .from("projects")
        .insert({ name, description, workspace_id: "YOUR_WORKSPACE_ID" }) // Replace with the actual workspace ID
        .single();

      if (error) {
        console.error("Error creating project:", error);
      } else {
        setProjects([...projects, data as Project]);
        setShowModal(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    }
  };

  return (
    <div className="project-list">
      <h2>Projects</h2>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
          </li>
        ))}
      </ul>
      <button onClick={() => setShowModal(true)}>Create Project</button>
      {showModal && (
        <ProjectModal
          onSubmit={handleCreateProject}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectList;
