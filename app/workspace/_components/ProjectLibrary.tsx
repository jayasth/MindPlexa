// C:/coding/MindPlexa/app/projects/ProjectLibrary.tsx

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import Link from 'next/link';

type Project = Tables<'projects'>;

interface ProjectLibraryProps {
  workspaceId?: string; // Make workspaceId optional
}

const ProjectLibrary: React.FC<ProjectLibraryProps> = ({ workspaceId }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const supabase = createClient();
    let query = supabase.from('projects').select('*');

    if (workspaceId) {
      query = query.eq('workspace_id', workspaceId); // Optional filtering based on workspaceId
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data as Project[]);
    }
  };

  const handleCreateProject = async () => {
    const supabase = createClient();
    const { data: newProject, error } = await supabase
      .from('projects')
      .insert({ name: 'New Project', description: '' }) // Removed workspace_id from insertion
      .single();

    if (error) {
      console.error('Error creating project:', error);
    } else {
      setProjects([...projects, newProject as Project]);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Projects</h2>
      <button
        onClick={handleCreateProject}
        className="px-4 py-2 mb-4 font-bold text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        Create Project
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project) => (
          <div key={project.id} className="bg-white shadow-md rounded-lg p-6">
            <Link href={`/projects/${project.id}`}>
              <a className="text-lg font-semibold mb-2">{project.name}</a>
            </Link>
            <p className="text-gray-600">{project.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectLibrary;
