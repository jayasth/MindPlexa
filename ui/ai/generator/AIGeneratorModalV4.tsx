import React, { useState, useEffect } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Edge, Node } from 'reactflow';
import { parseMermaidCode } from './mermaidGeneratorUtilsV4';
import { promptTemplateV4 } from '@/app/prompts/generatorPromptV4';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from './ConfirmIntegrationModal';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from './AIGeneratorModal.module.css';
import { applyLayout } from '@/ui/ai/generator/aiPositioningUtilsV4';

interface AIGeneratorModalV4Props {
  isOpen: boolean;
  onClose: () => void;
}

type LayoutType =
  | 'mindmap'
  | 'timeline'
  | 'hierarchical'
  | 'workflow'
  | 'radial-cluster'
  | 'force-directed'
  | 'grid'
  | 'concept-map';

const layoutOptions: { value: LayoutType; label: string }[] = [
  { value: 'mindmap', label: 'Mind Map' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'hierarchical', label: 'Hierarchical Tree' },
  { value: 'workflow', label: 'Workflow Diagram' },
  { value: 'radial-cluster', label: 'Radial Cluster' },
  { value: 'force-directed', label: 'Force-Directed Network' },
  { value: 'grid', label: 'Grid Layout' },
  { value: 'concept-map', label: 'Concept Map' }
];

const AIGeneratorModalV4: React.FC<AIGeneratorModalV4Props> = ({
  isOpen,
  onClose
}) => {
  const [projectConcept, setProjectConcept] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('mindmap');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setNodes, nodes: existingNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();
  const { isLoading: uiIsLoading, setIsLoading } = useUIStore();
  const { canvasId } = useCanvasStore();

  const handleProjectConceptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProjectConcept(e.target.value);
    setFollowUpQuestion('');
  };

  const handleGenerateCanvas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    console.log('Selected layout type:', selectedLayout);

    try {
      const prompt = promptTemplateV4(projectConcept);
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, version: 'v4', model: selectedModel })
      });

      if (!response.ok) {
        throw new Error('Failed to generate canvas');
      }

      const data = await response.json();
      console.log('AIGeneratorModalV4 Response data:', data);

      if (data.needsFollowUp) {
        setFollowUpQuestion(data.followUpQuestion);
        setIsLoading(false);
        return;
      }

      const canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const { nodes, edges } = await parseMermaidCode(
        data.mermaidCode,
        projectConcept
      );
      const layoutedNodes = applyLayout(
        nodes,
        edges,
        canvasSize,
        selectedLayout
      );
      console.log('Layouted nodes:', layoutedNodes);

      if (existingNodes.length > 0) {
        setGeneratedNodes(layoutedNodes);
        setGeneratedEdges(edges);
        setShowConfirmModal(true);
      } else {
        handleConfirmIntegration(layoutedNodes, edges);
      }
    } catch (error) {
      console.error('Error generating canvas:', error);
      setErrorMessage(
        'An error occurred while generating the canvas. Please try again.'
      );
    }

    setIsLoading(false);
  };

  const handleConfirmIntegration = (newNodes: Node[], newEdges: Edge[]) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    const optimizedNodes = applyLayout(
      newNodes,
      newEdges,
      canvasSize,
      selectedLayout
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
          <h2 className={styles.modalHeader}>AI Node Network Generator V4</h2>
          <form onSubmit={handleGenerateCanvas}>
            <textarea
              className={styles.textarea}
              placeholder="Enter your project topic or main idea"
              value={projectConcept}
              onChange={handleProjectConceptChange}
            />
            {followUpQuestion && (
              <p className={styles.followUpQuestion}>{followUpQuestion}</p>
            )}
            {errorMessage && (
              <p className={styles.errorMessage}>{errorMessage}</p>
            )}
            <div className={styles.actionContainer}>
              <Dropdown
                value={selectedModel}
                onChange={(value) => setSelectedModel(value)}
                variant="slim"
                className={styles.dropdown}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4o">GPT-4o</option>
              </Dropdown>
              <Dropdown
                value={selectedLayout}
                onChange={(value) => setSelectedLayout(value as LayoutType)}
                variant="slim"
                className={styles.dropdown}
              >
                {layoutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Dropdown>
              <Button
                type="submit"
                disabled={uiIsLoading || !projectConcept.trim()}
                loading={uiIsLoading}
                variant="submit"
                className={styles.generateButton}
              >
                {uiIsLoading ? (
                  <span className={styles.generatingText}>Generating...</span>
                ) : (
                  'Generate'
                )}
              </Button>
            </div>
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

export default AIGeneratorModalV4;
