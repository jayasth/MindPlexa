import React, { useState } from 'react';
import { useCompletion } from 'ai/react';
import { parseMermaidCode } from '@/ui/canvasEditor/utils/mermaidUtils';
import { useStore } from '@/app/store/useCanvasStore';

interface AIAssistanceModalProps {
  onClose: () => void;
}

const AIAssistanceModal: React.FC<AIAssistanceModalProps> = ({ onClose }) => {
  const [topic, setTopic] = useState('');
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion();

  const { setNodes, setEdges } = useStore((state) => ({
    setNodes: state.setNodes,
    setEdges: state.setEdges
  }));

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.target.value);
    handleInputChange(e);
  };

  const handleGenerateMindmap = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSubmit(e); // Trigger the completion request
    console.log('AiAssistanceModal: AI Completion:', completion);
    const { nodes, edges } = await parseMermaidCode(completion);
    setNodes((currentNodes) => [...currentNodes, ...nodes]);
    setEdges((currentEdges) => [...currentEdges, ...edges]);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Generate Mindmap</h2>
        <form onSubmit={handleGenerateMindmap}>
          <textarea
            className="w-full h-32 p-2 mb-4 border border-gray-300 rounded"
            placeholder="Enter a topic or idea"
            value={topic}
            onChange={handleTopicChange}
          />
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Generate'}
            </button>
            <button
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAssistanceModal;
