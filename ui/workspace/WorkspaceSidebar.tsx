import React from 'react';
import Link from 'next/link';
import {
  FaThLarge,
  FaChartBar,
  FaPlus,
  FaCog,
  FaTachometerAlt
} from 'react-icons/fa';
import styles from './WorkspaceSidebar.module.css';

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
        <h2 className={`${styles.title} ${isOpen ? 'block' : 'hidden'}`}>
          Workspace
        </h2>
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
          href="/workspace"
          icon={<FaThLarge />}
          text="Overview"
          isOpen={isOpen}
        />
        <SidebarLink
          href="/workspace/canvases"
          icon={<FaThLarge />}
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

const SidebarLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  text: string;
  isOpen: boolean;
}> = ({ href, icon, text, isOpen }) => (
  <Link href={href} className={styles.link}>
    <span className={styles.icon}>{icon}</span>
    {isOpen && <span>{text}</span>}
  </Link>
);

export default WorkspaceSidebar;
