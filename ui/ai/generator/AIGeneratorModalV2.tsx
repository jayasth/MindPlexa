import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Edge, Node } from 'reactflow';
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
import styles from './AIGeneratorModal.module.css';
import { applyD3Layout } from '@/ui/ai/generator/aiPositioningUtilsV2';

interface AIGeneratorModalV2Props {
  isOpen: boolean;
  onClose: () => void;
}

const AIGeneratorModalV2: React.FC<AIGeneratorModalV2Props> = ({
  isOpen,
  onClose
}) => {
  const [projectConcept, setProjectConcept] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const { setNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();
  const { isLoading: uiIsLoading, setIsLoading } = useUIStore();
  const { canvasId } = useCanvasStore();

  const handleProjectConceptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProjectConcept(e.target.value);

    // Validate input and provide feedback
    if (e.target.value.trim().length < 10) {
      setFollowUpQuestion(
        'Please provide more details about your project idea.'
      );
    } else {
      setFollowUpQuestion('');
    }
  };

  const handleGenerateCanvas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Sanitize user input before sending to AI
    const sanitizedInput = projectConcept.replace(/[\[\]\(\)\{\}\,]/g, '');

    try {
      const prompt = promptTemplateV2(sanitizedInput);
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt, version: 'v2', model: selectedModel })
      });

      if (!response.ok) {
        throw new Error('Failed to generate canvas');
      }

      const data = await response.json();
      console.log('AIGeneratorModalV2 Response data:', data);

      if (data.needsFollowUp) {
        setFollowUpQuestion(data.followUpQuestion);
      } else {
        const canvasSize = {
          width: window.innerWidth,
          height: window.innerHeight
        };

        const { nodes: newNodes, edges: newEdges } = await parseMermaidCode(
          data.mermaidCode,
          sanitizedInput
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
          handleConfirmIntegration(
            updatedNodes,
            newEdges,
            data.suggestedLayout
          );
        }
      }
    } catch (error) {
      console.error('AIGeneratorModalV2: Error generating canvas:', error);
      alert('An error occurred while generating the canvas. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmIntegration = (newNodes, newEdges, layout) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    try {
      const optimizedNodes = applyD3Layout(
        newNodes,
        newEdges,
        canvasSize,
        layout
      );

      setNodes((currentNodes) => [...currentNodes, ...optimizedNodes]);
      setEdges((currentEdges) => [...currentEdges, ...newEdges]);
    } catch (error) {
      console.error('Error applying layout:', error);
      // Fallback to setting nodes without layout
      setNodes((currentNodes) => [...currentNodes, ...newNodes]);
      setEdges((currentEdges) => [...currentEdges, ...newEdges]);
    }
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
            <h2 className={styles.modalHeader}>AI Node Network Generator V2</h2>
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
        )}
        {showConfirmModal && (
          <ConfirmIntegrationModal
            onConfirm={() =>
              handleConfirmIntegration(generatedNodes, generatedEdges, onClose)
            }
            onCancel={handleCancelIntegration}
          />
        )}
      </div>
    </Modal>
  );
};

export default AIGeneratorModalV2;
