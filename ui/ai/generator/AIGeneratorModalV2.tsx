import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Edge, Node } from 'reactflow';
import { useCompletion } from 'ai/react';
import { parseMermaidCode } from './mermaidGeneratorUtilsV2';
import { promptTemplateV2 } from '@/app/prompts/generatorPromptV2';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from './ConfirmIntegrationModal';
import Dropdown from '@/ui/dropdown/Dropdown';
import { findOptimalPosition } from '@/ui/canvasEditor/utils/positioningUtils';
import styles from './AIGeneratorModal.module.css';

interface AIGeneratorModalV2Props {
  isOpen: boolean;
  onClose: () => void;
}

const AIGeneratorModalV2: React.FC<AIGeneratorModalV2Props> = ({
  isOpen,
  onClose
}) => {
  const [topic, setTopic] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion();

  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');

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
      const prompt = promptTemplateV2(topic);
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, version: selectedModel })
      });

      if (!response.ok) {
        throw new Error('Failed to generate mindmap');
      }

      const data = await response.json();
      console.log('AIGeneratorModalV2 Response data:', data);
      const { nodes: newNodes, edges: newEdges } = await parseMermaidCode(
        data.mermaidCode
      );

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

  const handleConfirmIntegration = (newNodes, newEdges) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    const optimalPosition = findOptimalPosition(
      useNodeStore.getState().nodes,
      canvasSize
    );

    const offsetNodes = newNodes.map((node) => {
      const title = node.data?.title || 'Untitled';
      const content = node.data?.content || 'No description available';
      console.log(`AIGeneratorModalV2 Node title: ${title}`);
      console.log(`AIGeneratorModalV2 Node content: ${content}`);
      return {
        ...node,
        position: {
          x: node.position.x + optimalPosition.x,
          y: node.position.y + optimalPosition.y
        },
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
      <div className={styles.modalInner}>
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
                <Dropdown
                  value={selectedModel}
                  onChange={(value) => setSelectedModel(value)}
                  variant="custom"
                  className={styles.dropdown}
                >
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                  <option value="gpt-4o">GPT-4o</option>
                </Dropdown>
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
      </div>
    </Modal>
  );
};

export default AIGeneratorModalV2;
