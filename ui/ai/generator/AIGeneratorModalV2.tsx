import React, { useState } from 'react';
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { Edge, Node } from 'reactflow';
import { parseMermaidCode } from './mermaidGeneratorUtilsV2';
import {
  projectAnalysisPrompt,
  layoutGenerationPrompt
} from '@/app/prompts/generatorPromptV2';
import {
  useNodeStore,
  useEdgeStore,
  useUIStore,
  useCanvasStore
} from '@/app/store';
import Button from '@/ui/Button/Button';
import ConfirmIntegrationModal from './ConfirmIntegrationModal';
import Dropdown from '@/ui/dropdown/Dropdown';
import styles from './AIGeneratorModalV2.module.css';
import { applyLayout } from '@/ui/ai/generator/aiPositioningUtilsV2';

interface AIGeneratorModalV2Props {
  isOpen: boolean;
  onClose: () => void;
}

const AIGeneratorModalV2: React.FC<AIGeneratorModalV2Props> = ({
  isOpen,
  onClose
}) => {
  const [projectConcept, setProjectConcept] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [generatedNodes, setGeneratedNodes] = useState<Node[]>([]);
  const [generatedEdges, setGeneratedEdges] = useState<Edge[]>([]);
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { setNodes, nodes: existingNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();
  const { isLoading: uiIsLoading, setIsLoading } = useUIStore();
  const { canvasId } = useCanvasStore();

  const handleProjectConceptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProjectConcept(e.target.value);
    setErrorMessage(null);
  };

  const handleGenerateCanvas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // Step 1: Analyze the project concept
      const analysisPrompt = projectAnalysisPrompt(projectConcept);
      const analysisResponse = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: analysisPrompt, model: selectedModel })
      });

      if (!analysisResponse.ok) {
        throw new Error('Failed to analyze project concept');
      }

      const analysisData = await analysisResponse.json();
      setAnalysisResult(analysisData);
      console.log('Project analysis:', analysisData);

      // Step 2: Generate the layout based on the analysis
      const layoutPrompt = layoutGenerationPrompt(
        projectConcept,
        JSON.stringify(analysisData)
      );
      const layoutResponse = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: layoutPrompt, model: selectedModel })
      });

      if (!layoutResponse.ok) {
        throw new Error('Failed to generate layout');
      }

      const layoutData = await layoutResponse.json();
      console.log('Generated layout:', layoutData);

      const canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const { nodes, edges, warning } = await parseMermaidCode(
        layoutData.mermaidCode,
        projectConcept
      );

      if (warning) {
        setErrorMessage(warning);
      }

      const layoutedNodes = applyLayout(
        nodes,
        edges,
        canvasSize,
        analysisData.suggestedLayout
      );

      if (existingNodes.length > 0) {
        setGeneratedNodes(layoutedNodes);
        setGeneratedEdges(edges);
        setShowConfirmModal(true);
      } else {
        handleConfirmIntegration(
          layoutedNodes,
          edges,
          analysisData.suggestedLayout
        );
      }
    } catch (error) {
      console.error('Error generating canvas:', error);
      setErrorMessage(
        'An error occurred while generating the canvas. Please try again.'
      );
    }

    setIsLoading(false);
  };

  const handleConfirmIntegration = (newNodes, newEdges, layout) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    try {
      const optimizedNodes = applyLayout(
        newNodes,
        newEdges,
        canvasSize,
        layout
      );
      setNodes((currentNodes) => [...currentNodes, ...optimizedNodes]);
      setEdges((currentEdges) => [...currentEdges, ...newEdges]);
    } catch (error) {
      console.error('Error applying layout:', error);
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
          <h2 className={styles.modalHeader}>AI Node Network Generator V2</h2>
          <form onSubmit={handleGenerateCanvas}>
            <textarea
              className={styles.textarea}
              placeholder="Enter your project concept or main idea"
              value={projectConcept}
              onChange={handleProjectConceptChange}
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
                disabled={uiIsLoading || !projectConcept.trim()}
                loading={uiIsLoading}
                variant="submit"
                className={styles.generateButton}
              >
                {uiIsLoading ? 'Generating...' : 'Generate Network'}
              </Button>
            </div>
          </form>
          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}
        </div>
      </Modal>
      {showConfirmModal && (
        <ConfirmIntegrationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={() =>
            handleConfirmIntegration(
              generatedNodes,
              generatedEdges,
              analysisResult.suggestedLayout
            )
          }
          onCancel={handleCancelIntegration}
        />
      )}
    </>
  );
};

export default AIGeneratorModalV2;
