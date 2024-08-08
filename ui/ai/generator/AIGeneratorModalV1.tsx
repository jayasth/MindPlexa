import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Edge, Node } from 'reactflow';
import { useCompletion } from 'ai/react';
import { parseMermaidCode } from './mermaidGeneratorUtilsV1';
import { promptTemplateV1 } from '@/app/prompts/generatorPromptV1';
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

interface AIGeneratorModalV1Props {
  isOpen: boolean;
  onClose: () => void;
}

const AIGeneratorModalV1: React.FC<AIGeneratorModalV1Props> = ({
  isOpen,
  onClose
}) => {
  const [step, setStep] = useState(1);
  const [projectConcept, setProjectConcept] = useState('');
  const [projectDetails, setProjectDetails] = useState('');
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

  const handleProjectConceptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProjectConcept(e.target.value);
  };

  const handleProjectDetailsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProjectDetails(e.target.value);
  };

  const handleNext = () => {
    if (projectConcept.trim()) {
      setStep(2);
    }
  };

  const handleGenerateCanvas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const prompt = promptTemplateV1(
        `Project Concept: ${projectConcept}\nProject Details: ${projectDetails}`
      );
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, version: selectedModel })
      });

      if (!response.ok) {
        throw new Error('Failed to generate canvas');
      }

      const data = await response.json();
      console.log('AIGeneratorModalV1 Response data:', data);
      const { nodes: newNodes, edges: newEdges } = await parseMermaidCode(
        data.mermaidCode,
        projectDetails
      );

      const updatedNodes = newNodes.map((node) => ({
        ...node,
        data: {
          ...node.data,
          title: node.data?.title || 'Untitled',
          content: node.data?.content || 'No description available'
        }
      }));

      const existingNodes = useNodeStore.getState().nodes;

      if (existingNodes.length > 0) {
        setGeneratedNodes(updatedNodes);
        setGeneratedEdges(newEdges);
        setShowConfirmModal(true);
      } else {
        handleConfirmIntegration(updatedNodes, newEdges);
      }
    } catch (error) {
      console.error('AIGeneratorModalV1: Error generating canvas:', error);
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

    const offsetNodes = newNodes.map((node) => ({
      ...node,
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
            <h2 className={styles.modalHeader}>AI Node Network Generator</h2>
            <form onSubmit={step === 1 ? handleNext : handleGenerateCanvas}>
              {step === 1 && (
                <>
                  <textarea
                    className={styles.textarea}
                    placeholder="Enter your project topic or main idea"
                    value={projectConcept}
                    onChange={handleProjectConceptChange}
                  />
                  <Button
                    onClick={handleNext}
                    variant="sleek"
                    className={styles.nextButton}
                    disabled={!projectConcept.trim()}
                  >
                    Next
                  </Button>
                </>
              )}
              {step === 2 && (
                <>
                  <textarea
                    className={styles.textarea}
                    placeholder="Provide additional context or details about your project"
                    value={projectDetails}
                    onChange={handleProjectDetailsChange}
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
                      {uiIsLoading ? 'Generating...' : 'Generate Network'}
                    </Button>
                  </div>
                </>
              )}
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

export default AIGeneratorModalV1;
