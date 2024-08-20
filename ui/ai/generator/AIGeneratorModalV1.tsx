import React, { useState } from 'react';
import { Edge, Node } from 'reactflow';
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
import Modal from '@/ui/Modal/Modal';
import styles from './AIGeneratorModal.module.css';
import { applyLayout } from '@/ui/ai/generator/aiPositioningUtilsV1';
import { createBulkNodes } from '@/utils/canvas/nodeService';
import { createEdgeBetweenNodes } from '@/utils/canvas/edgeService';
import { Database } from '@/types_db';
import { v4 as uuidv4 } from 'uuid';

interface AIGeneratorModalV1Props {
  isOpen: boolean;
  onClose: () => void;
}

type LayoutType =
  | 'mindmap'
  | 'workflow'
  | 'concept-map'
  | 'grid'
  | 'hierarchical';

const layoutOptions: { value: LayoutType; label: string }[] = [
  { value: 'mindmap', label: 'Mind Map' },
  { value: 'workflow', label: 'Workflow Diagram' },
  { value: 'concept-map', label: 'Concept Map' },
  { value: 'grid', label: 'Grid Layout' },
  { value: 'hierarchical', label: 'Hierarchical Tree' }
];

const AIGeneratorModalV1: React.FC<AIGeneratorModalV1Props> = ({
  isOpen,
  onClose
}) => {
  const [projectConcept, setProjectConcept] = useState('');
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswer, setFollowUpAnswer] = useState('');
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
  const [followUpCount, setFollowUpCount] = useState(0);
  const MAX_FOLLOW_UP = 1;
  const [aiResponse, setAIResponse] = useState<any>(null);

  const handleProjectConceptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setProjectConcept(e.target.value);
    setFollowUpQuestion('');
    setFollowUpAnswer('');
  };

  const handleFollowUpAnswerChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setFollowUpAnswer(e.target.value);
  };

  const handleGenerateCanvas = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    console.log('Selected layout type:', selectedLayout);

    try {
      const prompt = promptTemplateV1(projectConcept, followUpAnswer);
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          version: 'v1',
          model: selectedModel,
          initialConcept: projectConcept,
          followUpAnswer: followUpAnswer,
          forceGenerate: followUpCount >= MAX_FOLLOW_UP
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AIGeneratorModalV1 Response data:', data);

      setAIResponse(data);

      // Handle follow-up question
      if (data.needsFollowUp && followUpCount < MAX_FOLLOW_UP) {
        setFollowUpQuestion(data.followUpQuestion);
        setFollowUpAnswer(''); // Reset the follow-up answer
        setFollowUpCount((prevCount) => prevCount + 1);
        setIsLoading(false);
        return; // Exit the function here, don't proceed to Mermaid parsing
      }

      // Reset follow-up related states
      setFollowUpQuestion('');
      setFollowUpAnswer('');
      setFollowUpCount(0);

      // If there's no mermaidCode, show an error
      if (!data.mermaidCode) {
        throw new Error('No Mermaid code generated. Please try again.');
      }

      const canvasSize = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      const { nodes, edges, warning } = await parseMermaidCode(
        data.mermaidCode,
        projectConcept
      );

      if (warning) {
        setErrorMessage(warning);
      }

      const scaleFactor = 0.8; // Adjust this value as needed
      const layoutedNodes = applyLayout(
        nodes,
        edges,
        canvasSize,
        selectedLayout,
        scaleFactor
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

  const handleConfirmIntegration = async (
    newNodes: Node[],
    newEdges: Edge[]
  ) => {
    const canvasSize = { width: window.innerWidth, height: window.innerHeight };
    const scaleFactor = 0.8; // Adjust this value as needed
    const optimizedNodes = applyLayout(
      newNodes,
      newEdges,
      canvasSize,
      selectedLayout,
      scaleFactor
    );

    try {
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
          type:
            (node.type as Database['public']['Enums']['node_type']) || 'note',
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
        isOpen={isOpen && !showConfirmModal}
        onClose={onClose}
        title="Custom AI Project Planner"
      >
        <div className={styles.content}>
          <form onSubmit={handleGenerateCanvas}>
            <textarea
              className={styles.textarea}
              placeholder="Describe your project idea or goal and let AI create a structured plan"
              value={projectConcept}
              onChange={handleProjectConceptChange}
            />
            {followUpQuestion && (
              <>
                <p className={styles.followUpQuestion}>{followUpQuestion}</p>
                <textarea
                  className={styles.textarea}
                  placeholder="Your answer to the follow-up question"
                  value={followUpAnswer}
                  onChange={handleFollowUpAnswerChange}
                />
              </>
            )}
            <div className={styles.actionContainer}>
              <div className={styles.dropdownContainer}>
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
              </div>
              <Button
                type="submit"
                disabled={uiIsLoading || !projectConcept.trim()}
                loading={uiIsLoading}
                variant="submit"
                className={styles.generateButton}
              >
                {uiIsLoading ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          </form>
          {errorMessage && (
            <p className={styles.errorMessage}>{errorMessage}</p>
          )}
          {aiResponse && aiResponse.mermaidCode && (
            <div className={styles.mermaidPreview}>
              <h3>Generated Mermaid Code:</h3>
              <pre>{aiResponse.mermaidCode}</pre>
            </div>
          )}
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

export default AIGeneratorModalV1;
