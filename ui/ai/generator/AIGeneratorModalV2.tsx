import React, { useState } from 'react';
import { Edge, Node } from 'reactflow';
import { parseMermaidCode } from './mermaidGeneratorUtilsV2';
import { useNodeStore, useEdgeStore } from '@/app/store';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from './ConfirmIntegrationModal';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import styles from './AIGeneratorModal.module.css';

interface AIAssistanceModalProps {
  onClose: () => void;
}

const AIAssistanceModalV2: React.FC<AIAssistanceModalProps> = ({ onClose }) => {
  const [topic, setTopic] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { setNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.target.value);
  };

  const handleGenerateMindmap = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      const mockMermaidCode = `
        graph TD
          A[note::Digital Marketing::Overview of digital marketing strategies]
          B[task::SEO::Optimize website content for search engines]
          C[calendar::Content Calendar::Plan and schedule content creation]
          D[draw::Marketing Funnel::Visualize customer journey]
          E[table::Analytics::Track key performance indicators]
          A --> B
          A --> C
          A --> D
          A --> E
      `;

      const { nodes: newNodes, edges: newEdges } =
        await parseMermaidCode(mockMermaidCode);

      setGeneratedNodes(newNodes);
      setGeneratedEdges(newEdges);
      setShowConfirmModal(true);
    } catch (error) {
      console.error('AIGeneratorModal: Error generating mindmap:', error);
      // Handle error state
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIntegration = () => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    const optimalPosition = findOptimalPosition(
      useNodeStore.getState().nodes,
      canvasSize
    );

    const offsetNodes = generatedNodes.map((node) => ({
      ...node,
      position: {
        x: node.position.x + optimalPosition.x,
        y: node.position.y + optimalPosition.y
      }
    }));

    setNodes((currentNodes) => [...currentNodes, ...offsetNodes]);
    setEdges((currentEdges) => [...currentEdges, ...generatedEdges]);
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
          onConfirm={handleConfirmIntegration}
          onCancel={handleCancelIntegration}
        />
      )}
    </div>
  );
};

export default AIAssistanceModalV2;
