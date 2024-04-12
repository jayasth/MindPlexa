'use client';
import Diagram from './_components/diagram';
import Button from '@/components/ui/Button';
import { Textarea } from '@/components/ui/textarea';
import { useCompletion } from 'ai/react';
import { createClient } from '@/utils/supabase/supabaseClient';
import Toolbar from './_components/toolbar';

export default function Protected() {
  const supabase = createClient();
  const {
    completion: mermaidCode,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useCompletion();

  // Asynchronously fetch the user data
  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user; // This is the correct destructuring based on your provided examples
  };

  // Handle user check and permissions
  const userCheck = async () => {
    const user = await fetchUser();
    if (!user || user.email !== process.env.ALLOWED_EMAIL) {
      return (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-3xl font-bold">403</div>
          <div className="text-xl">Forbidden</div>
        </div>
      );
    }
  };

  userCheck();

  const Loading = () => (
    <div className="relative h-full">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        Loading...
      </div>
    </div>
  );

  const handleAddNode = () => {
    // Implement the logic to add a new node
  };

  const handleDeleteNode = () => {
    // Implement the logic to delete the selected node
  };

  return (
    <div className="flex h-screen">
      <div className="w-42 bg-gray-900 p-4">
        <Toolbar onAddNode={handleAddNode} onDeleteNode={handleDeleteNode} />
      </div>
      <div className="flex-1 flex flex-col">
        <form onSubmit={handleSubmit} className="p-4">
          <Textarea
            placeholder="Type here..."
            className="w-full rounded-b-none focus:outline-none"
            value={input}
            onChange={handleInputChange}
          />
          <Button className="rounded-t-none" type="submit">
            Submit
          </Button>
        </form>
        <div className="flex-1 bg-gray-900 p-4 overflow-auto">
          {isLoading ? (
            <Loading />
          ) : (
            <Diagram mermaidCode={mermaidCode} isComplete={!isLoading} />
          )}
        </div>
      </div>
    </div>
  );
}
