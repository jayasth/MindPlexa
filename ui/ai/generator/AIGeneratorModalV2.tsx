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
import styles from './AIGeneratorModalV2.module.css';
import { applyLayout } from '@/ui/ai/generator/aiPositioningUtilsV2';
import { createBulkNodes } from '@/utils/canvas/nodeService';
import { createEdgeBetweenNodes } from '@/utils/canvas/edgeService';
import { Database } from '@/types_db';
import { v4 as uuidv4 } from 'uuid';

interface AIGeneratorModalV2Props {
  isOpen: boolean;
  onClose: () => void;
}

type NodeType = Database['public']['Enums']['node_type'];

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
      console.log('Generating canvas with project concept:', projectConcept);
      const prompt = promptTemplateV2(projectConcept);

      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, version: 'v2', model: selectedModel })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate canvas: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('AIGeneratorModalV2 Full API Response:', data);

      // Parse the mermaidCode string as JSON
      let parsedData;
      try {
        parsedData = JSON.parse(
          data.mermaidCode.replace(/```json\n|\n```/g, '')
        );
      } catch (parseError) {
        console.error('Error parsing mermaidCode as JSON:', parseError);
        throw new Error('Invalid response format');
      }

      // Check if parsedData has the expected structure
      if (!parsedData.analysis || !parsedData.mermaidCode) {
        console.error('Unexpected API response structure:', parsedData);
        throw new Error('Unexpected API response structure');
      }

      const { analysis, mermaidCode } = parsedData;
      setAnalysisResult(analysis);

      // Add this console log to see the selected layout
      console.log('Selected layout:', analysis.suggestedLayout);

      const canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const { nodes, edges, warning } = await parseMermaidCode(
        mermaidCode,
        projectConcept
      );

      if (warning) {
        setErrorMessage(warning);
      }

      const layout = analysis.suggestedLayout || 'force';

      const layoutedNodes = applyLayout(nodes, edges, canvasSize, layout);

      if (existingNodes.length > 0) {
        setGeneratedNodes(layoutedNodes);
        setGeneratedEdges(edges);
        setShowConfirmModal(true);
      } else {
        handleConfirmIntegration(layoutedNodes, edges, layout);
      }
    } catch (error) {
      console.error('Error generating canvas:', error);
      if (error instanceof Error) {
        setErrorMessage(
          `An error occurred while generating the canvas: ${error.message}. Please try again.`
        );
      } else {
        setErrorMessage(
          'An unexpected error occurred while generating the canvas. Please try again.'
        );
      }
    }

    setIsLoading(false);
  };

  const handleConfirmIntegration = async (
    newNodes: Node[],
    newEdges: Edge[],
    layout: string
  ) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    try {
      const optimizedNodes = applyLayout(
        newNodes,
        newEdges,
        canvasSize,
        layout as any
      );

      // Generate new UUIDs for each node
      const nodesWithNewIds = optimizedNodes.map((node) => ({
        ...node,
        id: uuidv4()
      }));

      // Create a mapping of old IDs to new IDs
      const idMapping = optimizedNodes.reduce((acc, node, index) => {
        acc[node.id] = nodesWithNewIds[index].id;
        return acc;
      }, {});

      // Update edge source and target with new IDs
      const updatedEdges = newEdges.map((edge) => ({
        ...edge,
        source: idMapping[edge.source],
        target: idMapping[edge.target]
      }));

      const { data: createdNodes, error } = await createBulkNodes(
        canvasId,
        nodesWithNewIds.map((node) => ({
          id: node.id,
          type: (node.type as NodeType) || 'note',
          position: node.position,
          data: {
            ...node.data,
            id: node.id,
            noteData:
              node.type === 'note' ? { content: node.data.content } : undefined,
            taskData:
              node.type === 'task' ? { tasks: node.data.tasks } : undefined,
            calendarData:
              node.type === 'calendar'
                ? { events: node.data.events }
                : undefined,
            tableData:
              node.type === 'table' ? { rows: node.data.rows } : undefined,
            drawData:
              node.type === 'draw'
                ? { drawingData: node.data.drawingData }
                : undefined
          }
        }))
      );

      if (error) {
        console.error('Error creating bulk nodes:', error);
        setErrorMessage('Failed to create nodes. Please try again.');
      } else {
        const setNodes = useNodeStore.getState().setNodes;
        const setEdges = useEdgeStore.getState().setEdges;

        setNodes((currentNodes) => [...currentNodes, ...(createdNodes || [])]);
        setEdges((currentEdges) => [...currentEdges, ...updatedEdges]);

        // Create edges in the database
        for (const edge of updatedEdges) {
          await createEdgeBetweenNodes({
            sourceNodeId: edge.source,
            targetNodeId: edge.target,
            canvasId
          });
        }

        setShowConfirmModal(false);
        onClose();
      }
    } catch (error) {
      console.error('Error applying layout or creating nodes:', error);
      setErrorMessage(
        'An error occurred while creating the nodes. Please try again.'
      );
    }
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
              analysisResult.suggestedLayout || 'force'
            )
          }
          onCancel={handleCancelIntegration}
        />
      )}
    </>
  );
};

export default AIGeneratorModalV2;
