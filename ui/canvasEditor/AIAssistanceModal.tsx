import React, { useState } from 'react';
import { useCompletion } from 'ai/react';

interface AIAssistanceModalProps {
  onClose: () => void;
  onGenerateMindmap: (mermaidCode: string) => void;
}

const AIAssistanceModal: React.FC<AIAssistanceModalProps> = ({
  onClose,
  onGenerateMindmap
}) => {
  const [topic, setTopic] = useState('');

  const {
    completion: mermaidCode,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useCompletion();

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.target.value);
  };

  const handleGenerateMindmap = async () => {
    await handleSubmit({} as React.FormEvent<HTMLFormElement>);
    onGenerateMindmap(mermaidCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Generate Mindmap</h2>
        <textarea
          className="w-full h-32 p-2 mb-4 border border-gray-300 rounded"
          placeholder="Enter a topic or idea"
          value={topic}
          onChange={handleTopicChange}
        />
        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded mr-2"
            onClick={handleGenerateMindmap}
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
      </div>
    </div>
  );
};

export default AIAssistanceModal;
