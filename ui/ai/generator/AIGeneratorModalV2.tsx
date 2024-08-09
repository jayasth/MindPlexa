import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Edge, Node } from 'reactflow';
import { useCompletion } from 'ai/react';
import { parseMermaidCode } from '@/ui/ai/generator/mermaidGeneratorUtilsV2';
import { optimizeAINodePositions } from '@/ui/ai/generator/aiPositioningUtils';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from '@/ui/ai/generator/ConfirmIntegrationModal';
import styles from '@/ui/ai/generator/AIGeneratorModal.module.css';
import { motion, AnimatePresence } from 'framer-motion';

interface AIAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistanceModalV2: React.FC<AIAssistanceModalProps> = ({
  isOpen,
  onClose
}) => {
  const [topic, setTopic] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion();

  const [selectedModel, setSelectedModel] = useState('gpt-4o');

  const { setNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();
  const { isLoading: uiIsLoading, setIsLoading } = useUIStore();
  const { canvasId } = useCanvasStore();

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.target.value);
    handleInputChange(e);
  };

  const handleGenerateMindmap = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: topic, version: 'v2' })
      });

      if (!response.ok) {
        throw new Error('Failed to generate mindmap');
      }

      const data = await response.json();
      console.log('AIGeneratorModalV2 Response data:', data);

      // Extract the Mermaid code from the response
      const mermaidCodeMatch = data.mermaidCode.match(
        /```mermaid\n([\s\S]*?)```/
      );
      const extractedMermaidCode = mermaidCodeMatch
        ? mermaidCodeMatch[1]
        : data.mermaidCode;

      const { nodes: newNodes, edges: newEdges } =
        await parseMermaidCode(extractedMermaidCode);

      const updatedNodes = newNodes.map((node) => {
        const title = node.data?.title || 'Untitled';
        const content = node.data?.content || 'No description available';
        console.log(`AIGeneratorModalV2 Node title: ${title}`);
        console.log(`AIGeneratorModalV2 Node content: ${content}`);
        return {
          ...node,
          data: {
            ...node.data,
            title,
            content
          }
        };
      });

      const existingNodes = useNodeStore.getState().nodes;

      if (existingNodes.length > 0) {
        setGeneratedNodes(updatedNodes);
        setGeneratedEdges(newEdges);
        setShowConfirmModal(true);
      } else {
        handleConfirmIntegration(updatedNodes, newEdges);
      }
    } catch (error) {
      console.error('AIGeneratorModalV2: Error generating mindmap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIntegration = (newNodes: Node[], newEdges: Edge[]) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };

    const offsetNodes = newNodes.map((node) => {
      const title = node.data?.title || 'Untitled';
      const content = node.data?.content || 'No description available';
      console.log(`AIGeneratorModalV2 Node title: ${title}`);
      console.log(`AIGeneratorModalV2 Node content: ${content}`);
      return {
        ...node,
        type: 'note',
        data: {
          ...node.data,
          title,
          content
        }
      };
    });

    setNodes((currentNodes) => [...currentNodes, ...offsetNodes]);
    setEdges((currentEdges) => [...currentEdges, ...newEdges]);
    setShowConfirmModal(false);
    onClose();
  };

  const handleCancelIntegration = () => {
    setShowConfirmModal(false);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      center
      classNames={{
        modal: styles.modalContent,
        overlay: styles.modalOverlay,
        closeButton: styles.closeButton
      }}
    >
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.modalInner}
        >
          {!showConfirmModal && (
            <div>
              <h2 className={styles.modalHeader}>Generate Mindmap (V2)</h2>
              <form onSubmit={handleGenerateMindmap}>
                <textarea
                  className={styles.textarea}
                  placeholder="Enter a topic or idea"
                  value={topic}
                  onChange={handleTopicChange}
                />
                <div className={styles.actionContainer}>
                  <Button
                    type="submit"
                    disabled={uiIsLoading}
                    loading={uiIsLoading}
                    variant="submit"
                    className={styles.generateButton}
                  >
                    {uiIsLoading ? 'Generating...' : 'Generate'}
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
        </motion.div>
      </AnimatePresence>
    </Modal>
  );
};

export default AIAssistanceModalV2;
