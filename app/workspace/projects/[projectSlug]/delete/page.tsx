import React from 'react';
import { useRouter } from 'next/navigation';

interface DeleteProjectPageProps {
  params: {
    projectSlug: string;
  };
}

const DeleteProjectPage: React.FC<DeleteProjectPageProps> = ({ params }) => {
  const { projectSlug } = params;
  const router = useRouter();

  const handleDelete = async () => {
    // Make an API call to delete the project based on the projectSlug
    // Redirect to the projects list page upon successful deletion
    router.push('/workspace/projects');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Delete Project</h1>
      <p>Are you sure you want to delete this project?</p>
      <button
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 mt-4"
        onClick={handleDelete}
      >
        Delete
      </button>
    </div>
  );
};

export default DeleteProjectPage;
