import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Edge, Node } from 'reactflow';
import { useCompletion } from 'ai/react';
import { parseMermaidCode } from '@/ui/ai/generator/mermaidGeneratorUtilsV2';
import {
  optimizeAINodePositions,
  LayoutType
} from '@/ui/ai/generator/aiPositioningUtilsV2';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from '@/ui/ai/generator/ConfirmIntegrationModal';
import Dropdown from '@/ui/dropdown/Dropdown';
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
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [existingMermaidCode, setExistingMermaidCode] = useState('');
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion();

  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [layoutType, setLayoutType] = useState<LayoutType>('hierarchical');

  const { setNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();
  const { isLoading: uiIsLoading, setIsLoading } = useUIStore();
  const { canvasId } = useCanvasStore();

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.target.value);
    handleInputChange(e);
  };

  const handleFollowUpChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFollowUpQuestion(e.target.value);
  };

  const handleNext = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (topic.trim()) {
      setStep(2);
    }
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
        body: JSON.stringify({
          prompt: topic,
          version: 'v2',
          existingMermaidCode,
          followUpQuestion
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate mindmap');
      }

      const data = await response.json();
      console.log('AIGeneratorModalV2 Response data:', data);

      const extractedMermaidCode = data.mermaidCode.match(
        /```mermaid\n([\s\S]*?)```/
      )[1];

      setExistingMermaidCode(extractedMermaidCode);

      const { nodes: newNodes, edges: newEdges } =
        await parseMermaidCode(extractedMermaidCode);

      console.log('Generated nodes:', newNodes);
      console.log('Generated edges:', newEdges);

      setGeneratedNodes(newNodes);
      setGeneratedEdges(newEdges);

      const existingNodes = useNodeStore.getState().nodes;

      if (existingNodes.length > 0) {
        setShowConfirmModal(true);
      } else {
        handleConfirmIntegration(newNodes, newEdges);
      }
    } catch (error) {
      console.error('AIGeneratorModalV2: Error generating mindmap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIntegration = (newNodes: Node[], newEdges: Edge[]) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };

    const optimizedNodes = optimizeAINodePositions(
      newNodes,
      newEdges,
      canvasSize,
      layoutType
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
              {step === 1 && (
                <form onSubmit={handleNext}>
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
                    <Dropdown
                      value={layoutType}
                      onChange={(value) => setLayoutType(value as LayoutType)}
                      variant="custom"
                      className={styles.dropdown}
                    >
                      <option value="hierarchical">Hierarchical</option>
                      <option value="circular">Circular</option>
                      <option value="forceDirected">Force-Directed</option>
                      <option value="spiral">Spiral</option>
                    </Dropdown>
                    <Button
                      type="submit"
                      variant="submit"
                      className={styles.nextButton}
                    >
                      Next
                    </Button>
                  </div>
                </form>
              )}
              {step === 2 && (
                <form onSubmit={handleGenerateMindmap}>
                  <textarea
                    className={styles.textarea}
                    placeholder="Ask a follow-up question or request changes"
                    value={followUpQuestion}
                    onChange={handleFollowUpChange}
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
              )}
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
