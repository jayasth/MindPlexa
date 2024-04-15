'use client';

import type { Tables } from 'types_db';
import ProjectForm from '../ProjectForm';
import ProjectToolbar from './ProjectToolbar';
import { createClient } from '@/utils/supabase/supabaseClient';
import { useRouter } from 'next/navigation';

type Project = Tables<'projects'>;

interface ProjectDetailsProps {
  project: Project;
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ project }) => {
  const router = useRouter();

  const handleDelete = async () => {
    const supabase = createClient();

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project.id);

    if (error) {
      console.log('Error deleting project:', error);
    } else {
      router.push('/projects');
    }
  };

  return (
    <div>
      <ProjectToolbar project={project} />
      <h1 className="text-3xl font-bold mb-4">{project.name}</h1>
      <p className="text-gray-600 mb-8">{project.description}</p>
      <h2 className="text-2xl font-bold mb-4">Edit Project</h2>
      <ProjectForm project={project} />
      <button
        onClick={handleDelete}
        className="px-4 py-2 mt-4 font-bold text-dark-text bg-red-500 rounded-md hover:bg-red-600"
      >
        Delete Project
      </button>
    </div>
  );
};

export default ProjectDetails;
