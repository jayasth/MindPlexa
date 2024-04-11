'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import { Tables } from '@/types_db';

type Project = Tables<'projects'>;

interface ProjectFormProps {
  project?: Project;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ project }) => {
  const router = useRouter();
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const supabase = createClient();

    if (project) {
      // Update existing project
      const { error } = await supabase
        .from('projects')
        .update({ name, description })
        .eq('id', project.id);

      if (error) {
        console.log('Error updating project:', error);
      } else {
        router.push(`/projects/${project.id}`);
      }
    } else {
      // Create new project
      const { data, error } = await supabase
        .from('projects')
        .insert({ name, description, workspace_id: 'default_workspace_id' })
        .select()
        .single();

      if (error) {
        console.log('Error creating project:', error);
      } else {
        const newProject = data as Project;
        router.push(`/projects/${newProject.id}`);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="name" className="block mb-2 font-bold">
          Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block mb-2 font-bold">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows={4}
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600"
      >
        {project ? 'Update Project' : 'Create Project'}
      </button>
    </form>
  );
};

export default ProjectForm;
