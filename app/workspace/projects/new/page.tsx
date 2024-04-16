import React from 'react';
import ProjectForm from '@/ui/project/ProjectForm';

export default function NewProjectPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <ProjectForm project={null} />
    </div>
  );
}
