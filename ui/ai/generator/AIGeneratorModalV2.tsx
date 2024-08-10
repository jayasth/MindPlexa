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
import { useToast } from '@/ui/Toasts/use-toast';

interface AIAssistanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIAssistanceModalV2: React.FC<AIAssistanceModalProps> = ({
  isOpen,
  onClose
}) => {
  const { toast } = useToast();
  const [topic, setTopic] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [existingMermaidCode, setExistingMermaidCode] = useState('');
  const { completion, input, handleInputChange, handleSubmit, isLoading } =
    useCompletion();

  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [layoutType, setLayoutType] = useState<LayoutType>('hierarchical');
  const [aiFollowUpQuestion, setAiFollowUpQuestion] = useState('');
  const [userResponse, setUserResponse] = useState('');
  const [step, setStep] = useState<'input' | 'followUp' | 'generate'>('input');

  const { setNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();
  const { isLoading: uiIsLoading, setIsLoading } = useUIStore();
  const { canvasId } = useCanvasStore();

  const handleTopicChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTopic(e.target.value);
    handleInputChange(e);
  };

  const handleAnalyzeInput = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/analyze-input', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: topic,
          version: 'v2'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.needsFollowUp) {
        setAiFollowUpQuestion(data.followUpQuestion);
        setStep('followUp');
      } else {
        await handleGenerateMindmap();
      }
    } catch (error) {
      console.error('AIGeneratorModalV2: Error analyzing input:', error);
      toast({
        title: 'Error',
        description: `Failed to analyze input. ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateMindmap = async () => {
    setIsLoading(true);
    setStep('generate');

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
          userResponse
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AIGeneratorModalV2 Response data:', data);

      if (!data.mermaidCode) {
        throw new Error('No Mermaid code generated');
      }

      const extractedMermaidCode = data.mermaidCode.match(
        /```mermaid\n([\s\S]*?)```/
      )?.[1];

      if (!extractedMermaidCode) {
        throw new Error('Failed to extract Mermaid code');
      }

      setExistingMermaidCode(extractedMermaidCode);

      const { nodes: newNodes, edges: newEdges } =
        await parseMermaidCode(extractedMermaidCode);

      console.log('Generated nodes:', newNodes);
      console.log('Generated edges:', newEdges);

      const optimizedNodes = optimizeAINodePositions(
        newNodes,
        newEdges,
        { width: window.innerWidth, height: window.innerHeight },
        layoutType
      );

      setGeneratedNodes(optimizedNodes);
      setGeneratedEdges(newEdges);

      const existingNodes = useNodeStore.getState().nodes;

      if (existingNodes.length > 0) {
        setShowConfirmModal(true);
      } else {
        handleConfirmIntegration(optimizedNodes, newEdges);
      }
    } catch (error) {
      console.error('AIGeneratorModalV2: Error generating mindmap:', error);
      toast({
        title: 'Error',
        description: `Failed to generate mindmap. ${error instanceof Error ? error.message : String(error)}`,
        variant: 'destructive'
      });
      setStep('input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserResponseChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setUserResponse(e.target.value);
  };

  const handleConfirmIntegration = (newNodes: Node[], newEdges: Edge[]) => {
    setNodes((currentNodes) => [...currentNodes, ...newNodes]);
    setEdges((currentEdges) => [...currentEdges, ...newEdges]);
    setShowConfirmModal(false);
    onClose();
  };

  const handleCancelIntegration = () => {
    setShowConfirmModal(false);
  };

  const handleUserResponseSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleGenerateMindmap();
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
              {step === 'input' && (
                <form onSubmit={handleAnalyzeInput}>
                  <textarea
                    className={styles.textarea}
                    placeholder="Enter a topic or idea for your project"
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
                      disabled={uiIsLoading || !topic.trim()}
                      loading={uiIsLoading}
                      variant="submit"
                      className={styles.generateButton}
                    >
                      {uiIsLoading ? 'Analyzing...' : 'Next'}
                    </Button>
                  </div>
                </form>
              )}
              {step === 'followUp' && (
                <form onSubmit={handleUserResponseSubmit}>
                  <h3>Follow-up Question</h3>
                  <p>{aiFollowUpQuestion}</p>
                  <textarea
                    className={styles.textarea}
                    placeholder="Provide your response to the follow-up question"
                    value={userResponse}
                    onChange={handleUserResponseChange}
                  />
                  <Button
                    type="submit"
                    disabled={uiIsLoading || !userResponse.trim()}
                    loading={uiIsLoading}
                    variant="submit"
                    className={styles.generateButton}
                  >
                    {uiIsLoading ? 'Generating...' : 'Generate Mindmap'}
                  </Button>
                </form>
              )}
              {step === 'generate' && (
                <div>
                  <p>Generating mindmap...</p>
                  {/* You can add a loading indicator or progress bar here */}
                </div>
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
