import React, { useState } from 'react';
import { useCompletion } from 'ai/react';
import { parseMermaidCode } from '@/ui/ai/generator/mermaidGeneratorUtils';
import { useStore } from '@/app/store/useCanvasStore';
import Button from '@/ui/Button/Button';
import styles from '@/ui/ai/generator/AIGeneratorModal.module.css';

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

    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: topic })
      });

      if (!response.ok) {
        throw new Error('Failed to generate mindmap');
      }

      const data = await response.json();
      console.log('Response data:', data);
      const { nodes, edges } = await parseMermaidCode(data.mermaidCode);
      setNodes((currentNodes) => [...currentNodes, ...nodes]);
      setEdges((currentEdges) => [...currentEdges, ...edges]);
      onClose();
    } catch (error) {
      console.error('Error generating mindmap:', error);
      // Handle error state
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalHeader}>Generate Mindmap</h2>
        <form onSubmit={handleGenerateMindmap}>
          <textarea
            className={styles.textarea}
            placeholder="Enter a topic or idea"
            value={topic}
            onChange={handleTopicChange}
          />
          <div className={styles.buttonContainer}>
            <Button
              className={styles.iconButton}
              type="submit"
              disabled={isLoading}
              variant="slim"
            >
              {isLoading ? 'Generating' : 'Generate'}
            </Button>
            <Button
              className={styles.iconButton}
              type="button"
              onClick={onClose}
              variant="slim"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AIAssistanceModal;
