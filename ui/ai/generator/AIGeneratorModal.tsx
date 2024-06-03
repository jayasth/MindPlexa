import React, { useState } from 'react';
import { Edge, Node } from 'reactflow';
import { useCompletion } from 'ai/react';
import { parseMermaidCode } from '@/ui/ai/generator/mermaidGeneratorUtils';
import { useStore } from '@/app/store/useCanvasStore';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from '@/ui/ai/generator/ConfirmIntegrationModal';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils'; // Updated import
import styles from '@/ui/ai/generator/AIGeneratorModal.module.css';

interface AIAssistanceModalProps {
  onClose: () => void;
}

const AIAssistanceModal: React.FC<AIAssistanceModalProps> = ({ onClose }) => {
  const [topic, setTopic] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
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
      const { nodes: newNodes, edges: newEdges } = await parseMermaidCode(
        data.mermaidCode
      );

      // Check if there are existing nodes on the canvas before setting new nodes
      const existingNodes = useStore.getState().nodes;

      if (existingNodes.length > 0) {
        setGeneratedNodes(newNodes);
        setGeneratedEdges(newEdges);
        setShowConfirmModal(true);
      } else {
        // Directly integrate the generated nodes and edges if the canvas is empty
        handleConfirmIntegration(newNodes, newEdges);
      }
    } catch (error) {
      console.error('Error generating mindmap:', error);
      // Handle error state
    }
  };

  const handleConfirmIntegration = (newNodes, newEdges) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    const optimalPosition = findOptimalPosition(
      useStore.getState().nodes,
      canvasSize
    ); // Updated function call

    const offsetNodes = newNodes.map((node) => ({
      ...node,
      data: {
        ...node.data,
        description: node.data?.description || 'Generated description here'
      },
      position: {
        x: node.position.x + optimalPosition.x,
        y: node.position.y + optimalPosition.y
      }
    }));

    setNodes((currentNodes) => [...currentNodes, ...offsetNodes]);
    setEdges((currentEdges) => [...currentEdges, ...newEdges]);
    setShowConfirmModal(false);
    onClose();
  };

  const handleCancelIntegration = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className={styles.modalOverlay}>
      {!showConfirmModal && (
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
      )}
      {showConfirmModal && (
        <ConfirmIntegrationModal
          onConfirm={() =>
            handleConfirmIntegration(generatedNodes, generatedEdges)
          }
          onCancel={handleCancelIntegration}
        />
      )}
    </div>
  );
};

export default AIAssistanceModal;
