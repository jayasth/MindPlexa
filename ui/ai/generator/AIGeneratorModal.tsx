import React, { useState } from 'react';
import { Edge, Node } from 'reactflow';
import { useCompletion } from 'ai/react';
import { parseMermaidCode } from '@/ui/ai/generator/mermaidGeneratorUtils';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from '@/ui/ai/generator/ConfirmIntegrationModal';
import Dropdown from '@/ui/dropdown/Dropdown';
import { optimizeAINodePositions } from '@/ui/ai/generator/aiPositioningUtils';
import Modal from '@/ui/Modal/Modal';
import styles from './AIGeneratorModal.module.css';

interface AIAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistanceModal: React.FC<AIAssistanceModalProps> = ({
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
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: topic, version: selectedModel })
      });

      if (!response.ok) {
        throw new Error('Failed to generate mindmap');
      }

      const data = await response.json();
      console.log('AIGeneratorModal Response data:', data);
      const { nodes: newNodes, edges: newEdges } = await parseMermaidCode(
        data.mermaidCode
      );

      const updatedNodes = newNodes.map((node) => {
        const title = node.data?.title || 'Untitled';
        const content = node.data?.content || 'No description available';
        console.log(`AIGeneratorModal Node title: ${title}`);
        console.log(`AIGeneratorModal Node content: ${content}`);
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
      console.error('AIGeneratorModal: Error generating mindmap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIntegration = (newNodes, newEdges) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    const optimizedNodes = optimizeAINodePositions(
      newNodes,
      newEdges,
      canvasSize
    );

    setNodes((currentNodes) => [...currentNodes, ...optimizedNodes]);
    setEdges((currentEdges) => [...currentEdges, ...newEdges]);
    setShowConfirmModal(false);
    onClose();
  };

  const handleCancelIntegration = () => {
    setShowConfirmModal(false);
  };

  return (
    <Modal
      isOpen={isOpen && !showConfirmModal}
      onClose={onClose}
      title="Generate Mindmap"
    >
      <div className={styles.content}>
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
              variant="sleek"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4o">GPT-4o</option>
            </Dropdown>
            <Button
              type="submit"
              disabled={uiIsLoading}
              loading={uiIsLoading}
              variant="submit"
            >
              {uiIsLoading ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AIAssistanceModal;
