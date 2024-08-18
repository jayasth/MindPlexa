import React, { useState } from 'react';
import Link from 'next/link';
import {
  FaTachometerAlt,
  FaLayerGroup,
  FaChartBar,
  FaPlus,
  FaCog,
  FaUser,
  FaBell,
  FaSignOutAlt
} from 'react-icons/fa';
import styles from './WorkspaceSidebar.module.css';
import { SignOut } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';

interface WorkspaceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  isOpen,
  onClose
}) => {
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    const syntheticEvent = {
      preventDefault: () => {},
      target: { elements: { pathName: { value: router.refresh } } }
    };
    await handleRequest(syntheticEvent as any, SignOut, router);
  };

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
          href="/workspace"
          icon={<FaTachometerAlt />}
          text="Overview"
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
          href="/dashboard/profile"
          icon={<FaUser />}
          text="Profile"
          isOpen={isOpen}
        />
        <SidebarLink
          href="/dashboard/account"
          icon={<FaCog />}
          text="Account Settings"
          isOpen={isOpen}
        />
        <SidebarLink
          href="#"
          icon={<FaSignOutAlt />}
          text="Sign Out"
          isOpen={isOpen}
          onClick={handleSignOut}
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
  onClick?: (e: React.MouseEvent) => void;
}> = ({ href, icon, text, isOpen, onClick }) => (
  <Link href={href} className={styles.link} onClick={onClick}>
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
