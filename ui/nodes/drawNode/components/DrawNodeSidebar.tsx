import React from 'react';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import styles from './DrawNodeSidebar.module.css';

interface DrawNodeSidebarProps {
  tools: any[];
  currentToolIndex: number;
  setCurrentToolIndex: (index: number) => void;
  textColor: string;
  backgroundColor: string;
}

const DrawNodeSidebar: React.FC<DrawNodeSidebarProps> = ({
  tools,
  currentToolIndex,
  setCurrentToolIndex,
  textColor,
  backgroundColor
}) => {
  const iconSize = 16;

  return (
    <div className={styles.sidebar}>
      {tools.map((tool, index) => (
        <Tooltip key={tool.tool.name} content={tool.tool.name}>
          <button
            className={`${styles.toolbarButton} ${
              currentToolIndex === index ? styles.selected : ''
            }`}
            onClick={() => setCurrentToolIndex(index)}
            style={{ color: textColor }}
          >
            <tool.icon size={iconSize} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
};

export default DrawNodeSidebar;
