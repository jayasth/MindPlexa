import React from 'react';
import ProjectForm from '@/ui/project/ProjectForm';

interface EditProjectPageProps {
  params: {
    projectSlug: string;
  };
}

const EditProjectPage: React.FC<EditProjectPageProps> = ({ params }) => {
  const { projectSlug } = params;

  const handleProjectSubmit = async (formData: any) => {
    // Make an API call to update the project using the form data and projectId
    // Redirect to the project details page upon successful update
  };

  // Fetch the project details based on the projectId and pass it as initial values to the ProjectForm

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Project</h1>
      <ProjectForm onSubmit={handleProjectSubmit} />
    </div>
  );
};

export default EditProjectPage;
