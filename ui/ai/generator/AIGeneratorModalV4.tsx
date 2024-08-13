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

type LayoutType = 'tree' | 'radial' | 'force' | 'mindmap' | 'timeline';

const layoutOptions: { value: LayoutType; label: string }[] = [
  { value: 'tree', label: 'Tree' },
  { value: 'radial', label: 'Radial' },
  { value: 'force', label: 'Force' },
  { value: 'mindmap', label: 'Mindmap' },
  { value: 'timeline', label: 'Timeline' }
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
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('tree');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setNodes } = useNodeStore();
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

    const sanitizedInput = projectConcept.replace(/[\[\]\(\)\{\}\,]/g, '');

    try {
      const prompt = promptTemplateV4(sanitizedInput);
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
      } else {
        const canvasSize = {
          width: window.innerWidth,
          height: window.innerHeight
        };

        const {
          nodes: newNodes,
          edges: newEdges,
          warning
        } = await parseMermaidCode(data.mermaidCode, sanitizedInput);

        if (warning) {
          setErrorMessage(warning);
        }

        console.log('Generated nodes:', newNodes);
        console.log('Generated edges:', newEdges);

        if (newNodes.length === 0 || newEdges.length === 0) {
          setErrorMessage(
            'Failed to generate a valid diagram. Please try again with a different input.'
          );
          setIsLoading(false);
          return;
        }

        const existingNodes = useNodeStore.getState().nodes;

        if (existingNodes.length > 0) {
          setGeneratedNodes(newNodes);
          setGeneratedEdges(newEdges);
          setShowConfirmModal(true);
        } else {
          handleConfirmIntegration(newNodes, newEdges);
        }
      }
    } catch (error) {
      console.error('AIGeneratorModalV4: Error generating canvas:', error);
      setErrorMessage(
        'An error occurred while generating the canvas. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIntegration = (newNodes: Node[], newEdges: Edge[]) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    try {
      console.log('Selected Layout Type:', selectedLayout);
      const optimizedNodes = applyLayout(
        newNodes,
        newEdges,
        canvasSize,
        selectedLayout
      );

      // Adjust the layout for mindmap to make it more comprehensive
      if (selectedLayout === 'mindmap') {
        const centerX = canvasSize.width / 2;
        const centerY = canvasSize.height / 2;
        optimizedNodes.forEach((node, index) => {
          const angle = (index / optimizedNodes.length) * 2 * Math.PI;
          const radius = 300; // Adjust the radius as needed
          node.position = {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle)
          };
        });
      }

      setNodes((currentNodes) => [...currentNodes, ...optimizedNodes]);
      setEdges((currentEdges) => [...currentEdges, ...newEdges]);
    } catch (error) {
      console.error('Error applying layout:', error);
      // Fallback to setting nodes without layout
      setNodes((currentNodes) => [
        ...currentNodes,
        ...newNodes.map((node, index) => ({
          ...node,
          position: {
            x: (index % 5) * 200 + 100,
            y: Math.floor(index / 5) * 200 + 100
          }
        }))
      ]);
      setEdges((currentEdges) => [...currentEdges, ...newEdges]);
      setErrorMessage(
        'An error occurred while applying the layout. Nodes have been added in a grid pattern.'
      );
    }
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
                variant="custom"
                className={styles.dropdown}
              >
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="gpt-4o">GPT-4o</option>
              </Dropdown>
              <Dropdown
                value={selectedLayout}
                onChange={(value) => setSelectedLayout(value as LayoutType)}
                variant="custom"
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
                {uiIsLoading ? 'Generating...' : 'Generate Network'}
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
