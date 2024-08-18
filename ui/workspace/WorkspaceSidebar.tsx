import React from 'react';
import Link from 'next/link';
import {
  FaTachometerAlt,
  FaLayerGroup,
  FaChartBar,
  FaPlus,
  FaCog
} from 'react-icons/fa';
import styles from './WorkspaceSidebar.module.css';
import { Tooltip } from '@/ui/Tooltip/Tooltip';
import { useState } from 'react';

interface WorkspaceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <aside
      className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
    >
      <div className={styles.header}>
        <button onClick={onClose} className={styles.toggleButton}>
          {isOpen ? '<<' : '>>'}
        </button>
      </div>
      <nav className={styles.nav}>
        <SidebarLink
          href="/dashboard"
          icon={<FaTachometerAlt />}
          text="Dashboard"
          isOpen={isOpen}
        />
        <SidebarLink
          href="/workspace/canvases"
          icon={<FaLayerGroup />}
          text="Canvases"
          isOpen={isOpen}
        />
        <SidebarLink
          href="/workspace/analytics"
          icon={<FaChartBar />}
          text="Analytics"
          isOpen={isOpen}
        />
        <SidebarLink
          href="/canvasEditor/new"
          icon={<FaPlus />}
          text="New Canvas"
          isOpen={isOpen}
        />
        <SidebarLink
          href="/workspace/settings"
          icon={<FaCog />}
          text="Settings"
          isOpen={isOpen}
        />
      </nav>
    </aside>
  );
};

const SidebarTooltip: React.FC<{
  content: string;
  children: React.ReactNode;
}> = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className={styles.tooltipWrapper}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && <div className={styles.tooltipContent}>{content}</div>}
    </div>
  );
};

const SidebarLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  text: string;
  isOpen: boolean;
}> = ({ href, icon, text, isOpen }) => (
  <Link href={href} className={styles.link}>
    {isOpen ? (
      <>
        <span className={styles.icon}>{icon}</span>
        <span className={styles.linkText}>{text}</span>
      </>
    ) : (
      <SidebarTooltip content={text}>
        <span className={styles.icon}>{icon}</span>
      </SidebarTooltip>
    )}
  </Link>
);

export default WorkspaceSidebar;
