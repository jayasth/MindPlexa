'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FaHome,
  FaFolder,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaRegClone
} from 'react-icons/fa';
import { MdDashboard } from 'react-icons/md';
import { GoGraph } from 'react-icons/go';
import { SignOut } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Creating a synthetic event as expected by the `handleRequest` function
    const syntheticEvent = {
      preventDefault: () => {},
      target: { elements: { pathName: { value: router.refresh } } }
    };
    await handleRequest(syntheticEvent as any, SignOut, router);
  };

  const menuItems = [
    { icon: <FaHome />, label: 'Dashboard', link: '/dashboard' },
    { icon: <MdDashboard />, label: 'Workspace', link: '/workspace' },
    { icon: <FaFolder />, label: 'Projects', link: '/projects' },
    { icon: <FaUser />, label: 'Profile', link: '/profile' },
    { icon: <FaCog />, label: 'Settings', link: '/settings' },
    { icon: <GoGraph />, label: 'New Canvas', link: '/canvas' },
    { icon: <FaRegClone />, label: 'Canvas Library', link: '/canvas' },
    { icon: <FaSignOutAlt />, label: 'Sign Out', action: handleSignOut }
  ];

  return (
    <div
      className={`${styles.sidebar} ${isExpanded ? styles.expanded : styles.collapsed}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {menuItems.map((item, index) =>
          item.link ? (
            <Link key={index} href={item.link} legacyBehavior>
              <a className={styles.menuItem}>
                <div className={styles.menuIcon}>{item.icon}</div>
                {isExpanded && (
                  <span className={styles.menuLabel}>{item.label}</span>
                )}
              </a>
            </Link>
          ) : (
            <div key={index} className={styles.menuItem} onClick={item.action}>
              <div className={styles.menuIcon}>{item.icon}</div>
              {isExpanded && (
                <span className={styles.menuLabel}>{item.label}</span>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Sidebar;
