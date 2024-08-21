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
import { applyLayout } from '@/ui/ai/generator/aiPositioningUtilsV3';
import styles from './AIGeneratorModal.module.css';

type LayoutType = 'mindmap' | 'tree' | 'flowchart';

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

  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('mindmap');

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
        body: JSON.stringify({ prompt, version: 'v3', model: selectedModel })
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

      const updatedNodes = applyLayout(
        newNodes,
        newEdges,
        selectedLayout,
        canvasSize
      );

      console.log('Generated nodes:', newNodes);
      console.log('Generated edges:', newEdges);

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
    const optimizedNodes = applyLayout(
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
    <>
      <Modal
        open={isOpen && !showConfirmModal}
        onClose={onClose}
        center
        classNames={{
          modal: styles.modalContent,
          overlay: styles.modalOverlay,
          closeButton: styles.closeButton
        }}
      >
        <div className={styles.modalInner}>
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
                    variant="slim"
                    className={styles.dropdown}
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4o">GPT-4o</option>
                  </Dropdown>
                  <Dropdown
                    value={selectedLayout}
                    onChange={(value) => setSelectedLayout(value as LayoutType)}
                    variant="slim"
                    className={styles.dropdown}
                  >
                    <option value="mindmap">Mindmap</option>
                    <option value="tree">Tree</option>
                    <option value="flowchart">Flowchart</option>
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
      </Modal>

      {showConfirmModal && (
        <ConfirmIntegrationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() =>
            handleConfirmIntegration(generatedNodes, generatedEdges)
          }
          onCancel={handleCancelIntegration}
        />
      )}
    </>
  );
};

export default AIGeneratorModalV3;
