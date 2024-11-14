import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FaTachometerAlt,
  FaLayerGroup,
  FaChartBar,
  FaPlus,
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaUserCircle
} from 'react-icons/fa';
import styles from './WorkspaceSidebar.module.css';
import { SignOut } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/supabaseClient';

interface WorkspaceSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorkspaceSidebar: React.FC<WorkspaceSidebarProps> = ({
  isOpen,
  onClose
}) => {
  const router = useRouter();
  const [isDeactivated, setIsDeactivated] = useState(false);

  useEffect(() => {
    const checkDeactivation = async () => {
      const supabase = createClient();
      const { data: userDetails } = await supabase
        .from('users')
        .select('is_deactivated')
        .single();

      setIsDeactivated(userDetails?.is_deactivated ?? false);
    };

    checkDeactivation();
  }, []);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    const syntheticEvent = {
      preventDefault: () => {},
      target: { elements: { pathName: { value: router.refresh } } }
    };
    await handleRequest(
      syntheticEvent as unknown as React.FormEvent<HTMLFormElement>,
      SignOut,
      router
    );
  };

  // Define allowed links for deactivated users
  const deactivatedAllowedLinks = ['/workspace/account'];

  // Filter navigation links based on deactivation status
  const getNavigationLinks = () => {
    const allLinks = [
      {
        href: '/workspace',
        icon: <FaTachometerAlt />,
        text: 'Overview'
      },
      {
        href: '/workspace/canvases',
        icon: <FaLayerGroup />,
        text: 'Canvases'
      },
      {
        href: '/workspace/analytics',
        icon: <FaChartBar />,
        text: 'Analytics'
      },
      {
        href: '/canvasEditor/new',
        icon: <FaPlus />,
        text: 'New Canvas'
      },
      {
        href: '/workspace/profile',
        icon: <FaUser />,
        text: 'Profile'
      },
      {
        href: '/workspace/settings',
        icon: <FaCog />,
        text: 'Settings'
      },
      {
        href: '/workspace/account',
        icon: <FaUserCircle />,
        text: 'Account'
      }
    ];

    return isDeactivated
      ? allLinks.filter((link) => deactivatedAllowedLinks.includes(link.href))
      : allLinks;
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
        {getNavigationLinks().map((link) => (
          <SidebarLink
            key={link.href}
            href={link.href}
            icon={link.icon}
            text={link.text}
            isOpen={isOpen}
          />
        ))}
        {/* Sign Out is always available */}
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
