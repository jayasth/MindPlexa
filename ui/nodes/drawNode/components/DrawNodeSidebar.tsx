import React from 'react';
import {
  FaPaintBrush,
  FaMarker,
  FaEraser,
  FaSprayCan,
  FaSquare,
  FaCircle,
  FaPen
} from 'react-icons/fa';
import { IoMdWater } from 'react-icons/io';
import { BsSlashLg } from 'react-icons/bs';
import { TbInnerShadowBottomRightFilled } from 'react-icons/tb';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import styles from './DrawNodeSidebar.module.css';

interface DrawNodeSidebarProps {
  currentTool: number;
  setCurrentTool: (index: number) => void;
  textColor: string;
}

const DrawNodeSidebar: React.FC<DrawNodeSidebarProps> = ({
  currentTool,
  setCurrentTool,
  textColor
}) => {
  const iconSize = 16;

  const toolGroups = [
    [
      { icon: FaPen, name: 'Pen' },
      { icon: BsSlashLg, name: 'Line' },
      { icon: FaSquare, name: 'Rectangle' },
      { icon: FaCircle, name: 'Circle' }
    ],
    [
      { icon: FaMarker, name: 'Marker' },
      { icon: FaPaintBrush, name: 'Brush' },
      { icon: IoMdWater, name: 'Watercolor' },
      { icon: FaSprayCan, name: 'Airbrush' },
      { icon: TbInnerShadowBottomRightFilled, name: 'Shading' },
      { icon: FaEraser, name: 'Eraser' }
    ]
  ];

  return (
    <div className={styles.sidebar}>
      {toolGroups.map((group, groupIndex) => (
        <div key={groupIndex} className={styles.toolGroup}>
          {group.map((tool, index) => (
            <Tooltip key={tool.name} content={tool.name}>
              <button
                className={`${styles.toolbarButton} ${
                  currentTool === index + (groupIndex === 1 ? 4 : 0)
                    ? styles.selected
                    : ''
                }`}
                onClick={() =>
                  setCurrentTool(index + (groupIndex === 1 ? 4 : 0))
                }
                style={{ color: textColor }}
              >
                <tool.icon size={iconSize} />
              </button>
            </Tooltip>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DrawNodeSidebar;
