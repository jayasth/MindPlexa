import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Edge, Node } from 'reactflow';
import { useCompletion } from 'ai/react';
import { parseMermaidCode } from './mermaidGeneratorUtilsV3';
import { promptTemplateV3 } from '@/app/prompts/generatorPromptV3';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from './ConfirmIntegrationModal';
import Dropdown from '@/ui/dropdown/Dropdown';
import { applyD3Layout } from '@/ui/ai/generator/aiPositioningUtilsV3';
import styles from './AIGeneratorModal.module.css';

type LayoutType = 'force' | 'radial' | 'tree';

interface AIGeneratorModalV3Props {
  isOpen: boolean;
  onClose: () => void;
}

const AIGeneratorModalV3: React.FC<AIGeneratorModalV3Props> = ({
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
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('force');

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
      const prompt = promptTemplateV3(
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
      console.log('AIGeneratorModalV3 Response data:', data);

      const canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const { nodes: newNodes, edges: newEdges } = await parseMermaidCode(
        data.mermaidCode,
        projectDetails
      );

      console.log('Generated nodes:', newNodes);
      console.log('Generated edges:', newEdges);

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
      console.error('AIGeneratorModalV3: Error generating canvas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIntegration = (newNodes, newEdges) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    const optimizedNodes = applyD3Layout(
      newNodes,
      newEdges,
      selectedLayout,
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
            <h2 className={styles.modalHeader}>AI Node Network Generator V3</h2>
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
                    <Dropdown
                      value={selectedLayout}
                      onChange={(value) =>
                        setSelectedLayout(value as LayoutType)
                      }
                      variant="custom"
                      className={styles.dropdown}
                    >
                      <option value="force">Force-Directed</option>
                      <option value="radial">Radial</option>
                      <option value="tree">Tree</option>
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

export default AIGeneratorModalV3;
