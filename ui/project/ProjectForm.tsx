'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';
import type { Tables } from 'types_db';
import Button from '@/ui/Button/Button';

type Project = Tables<'projects'>;
type ProjectFormProps = {
  project: Project | null;
};

const ProjectForm: React.FC<ProjectFormProps> = ({ project }) => {
  const router = useRouter();
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();

    if (project) {
      const { error } = await supabase
        .from('projects')
        .update({ name, description })
        .eq('id', project.id);

      if (error) {
        console.log('Error updating project:', error);
      } else {
        router.push(`/workspace/projects/${project.id}`);
      }
    } else {
      const { data, error } = await supabase
        .from('projects')
        .insert({ name, description })
        .single<Project>();

      if (error) {
        console.log('Error creating project:', error);
      } else {
        router.push('/workspace/projects');
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
      <Button type="submit" className="variant=sleek">
        {project?.id ? 'Update Project' : 'Create Project'}
      </Button>
    </form>
  );
};

export default ProjectForm;
