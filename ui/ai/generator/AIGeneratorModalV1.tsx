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
import { FaQuestionCircle } from 'react-icons/fa';
import { BsLightbulb } from 'react-icons/bs';
import { useRouter } from 'next/navigation';
import { useToast } from '@/ui/Toasts/use-toast';

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
  const [selectedModel, setSelectedModel] = useState(
    'claude-3-5-sonnet-20240620'
  );
  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('mindmap');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setNodes, nodes: existingNodes } = useNodeStore();
  const { setEdges } = useEdgeStore();
  const { isLoading: uiIsLoading, setIsLoading } = useUIStore();
  const { canvasId } = useCanvasStore();
  const [followUpCount, setFollowUpCount] = useState(0);
  const MAX_FOLLOW_UP = 2;
  const [responseType, setResponseType] = useState<
    'flowchart' | 'followUp' | 'advice' | 'noIntegration' | null
  >(null);
  const [responseContent, setResponseContent] = useState<string>('');
  const [responseExplanation, setResponseExplanation] = useState<string>('');
  const [isResponseReady, setIsResponseReady] = useState(false);
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const [parsedMermaidCode, setParsedMermaidCode] = useState<string | null>(
    null
  );

  const resetState = () => {
    setFollowUpQuestion('');
    setFollowUpAnswer('');
    setFollowUpCount(0);
    setResponseType(null);
    setResponseContent('');
    setResponseExplanation('');
    setIsResponseReady(false);
    setErrorMessage(null);
  };

  const handleProjectConceptChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newProjectConcept = e.target.value;
    if (newProjectConcept !== projectConcept) {
      setProjectConcept(newProjectConcept);
      resetState();
    }
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
    setIsResponseReady(false);

    // Reset follow-up count if it's a new project concept
    if (followUpCount >= MAX_FOLLOW_UP && projectConcept.trim() !== '') {
      setFollowUpCount(0);
    }

    try {
      const prompt = promptTemplateV1(
        projectConcept,
        followUpAnswer,
        followUpCount
      );
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          version: 'v1',
          model: selectedModel,
          initialConcept: projectConcept,
          followUpAnswer: followUpAnswer,
          followUpCount: followUpCount
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AIGeneratorModalV1 Response data:', data);

      setResponseType(data.responseType);
      setResponseContent(data.content);
      setResponseExplanation(data.explanation);

      if (data.responseType === 'flowchart') {
        const { nodes, edges, warning } = await parseMermaidCode(
          data.content,
          projectConcept
        );
        if (warning) {
          setErrorMessage(warning);
        }
        if (existingNodes.length > 0) {
          setGeneratedNodes(nodes);
          setGeneratedEdges(edges);
          setShowConfirmModal(true);
        } else {
          handleConfirmIntegration(nodes, edges);
        }
      } else if (data.responseType === 'advice') {
        setErrorMessage(null);
      } else if (data.responseType === 'followUp') {
        setFollowUpCount((prevCount) => prevCount + 1);
        setFollowUpAnswer('');
      }

      if (followUpCount >= MAX_FOLLOW_UP) {
        setResponseType('advice');
        setResponseContent(
          "I'm sorry, but I couldn't gather enough information to create a detailed project plan. Here's some general advice for project planning: " +
            data.content
        );
      }

      setIsResponseReady(true);
    } catch (error) {
      console.error('Error generating layout:', error);
      setErrorMessage(
        `An error occurred while processing your request: ${error instanceof Error ? error.message : 'Please try again.'}`
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
    setResponseType('noIntegration');
    setIsResponseReady(true);
  };

  const renderGeneratedContent = () => {
    if (!isResponseReady || responseType !== 'noIntegration') return null;

    return (
      <div className={styles.generatedContentContainer}>
        <h3 className={styles.sectionTitle}>Generated Project Structure</h3>
        <div className={styles.generatedContent}>
          {responseContent.split('\n').map((line, index) => {
            if (line.includes('::')) {
              const [title, description] = line.split('::');
              return (
                <div key={index} className={styles.nodeContent}>
                  <h4 className={styles.nodeTitle}>{title.trim()}</h4>
                  <p className={styles.nodeDescription}>{description.trim()}</p>
                </div>
              );
            }
            return null;
          })}
        </div>
        <Button
          onClick={copyGeneratedOutput}
          className={styles.copyButton}
          variant="slim"
        >
          Copy Content
        </Button>
      </div>
    );
  };

  const copyGeneratedOutput = () => {
    const content = responseContent
      .split('\n')
      .filter((line) => line.includes('::'))
      .map((line) => {
        const [title, description] = line.split('::');
        return `${title.trim()}\n${description.trim()}\n\n`;
      })
      .join('');

    navigator.clipboard.writeText(content);
    toast({
      title: 'Content Copied',
      description: 'The generated content has been copied to your clipboard.'
    });
    onClose();
  };

  const renderResponse = () => {
    if (!isResponseReady) return null;

    switch (responseType) {
      case 'followUp':
        return (
          <div className={styles.followUpContainer}>
            <FaQuestionCircle className={styles.icon} />
            <p className={styles.followUpQuestion}>{responseContent}</p>
            <textarea
              className={styles.textarea}
              placeholder="Your answer to the follow-up question"
              value={followUpAnswer}
              onChange={(e) => setFollowUpAnswer(e.target.value)}
            />
          </div>
        );
      case 'advice':
        return (
          <div className={styles.adviceContainer}>
            <BsLightbulb className={styles.icon} />
            <p className={styles.advice}>{responseContent}</p>
          </div>
        );
      default:
        return null;
    }
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
            {renderResponse()}
            {renderGeneratedContent()}
            <div className={styles.actionContainer}>
              <div className={styles.dropdownContainer}>
                <Dropdown
                  value={selectedModel}
                  onChange={(value) => setSelectedModel(value)}
                  variant="slim"
                  className={styles.dropdown}
                  disabled={responseType === 'followUp'}
                >
                  <option value="claude-3-5-sonnet-20240620">
                    Claude 3.5 Sonnet
                  </option>
                  <option value="gpt-4o">GPT-4o</option>
                </Dropdown>
                <Dropdown
                  value={selectedLayout}
                  onChange={(value) => setSelectedLayout(value as LayoutType)}
                  variant="slim"
                  className={styles.dropdown}
                  disabled={responseType === 'followUp'}
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
                disabled={
                  uiIsLoading ||
                  (!projectConcept.trim() && !followUpAnswer.trim())
                }
                loading={uiIsLoading}
                variant="submit"
                className={styles.generateButton}
              >
                {uiIsLoading
                  ? 'Generating...'
                  : responseType === 'followUp'
                    ? 'Submit Answer'
                    : 'Generate'}
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
            handleConfirmIntegration(generatedNodes, generatedEdges)
          }
          onCancel={handleCancelIntegration}
        />
      )}
    </>
  );
};

export default AIGeneratorModalV1;
