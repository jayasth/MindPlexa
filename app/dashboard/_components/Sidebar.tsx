'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaHome, FaFolder, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';
import { SignOut } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    // Creating a synthetic event as expected by the `handleRequest` function
    const syntheticEvent = {
      preventDefault: () => {},
      target: {
        elements: { pathName: { value: router.pathname } }
      }
    };
    await handleRequest(syntheticEvent, SignOut, router);
  };

  const menuItems = [
    { icon: <FaHome />, label: 'Dashboard', link: '/dashboard' },
    { icon: <FaFolder />, label: 'Projects', link: '/projects' },
    { icon: <FaUser />, label: 'Profile', link: '/profile' },
    { icon: <FaCog />, label: 'Settings', link: '/settings' },
    {
      icon: <FaSignOutAlt />,
      label: 'Sign Out',
      action: handleSignOut
    }
  ];

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-white shadow-md overflow-hidden transition-all duration-300 ${
        isExpanded ? 'w-60' : 'w-16'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div className="flex flex-col h-full">
        {menuItems.map((item, index) =>
          item.link ? (
            <Link key={index} href={item.link} legacyBehavior>
              <a className="flex items-center py-4 px-6 text-gray-600 hover:bg-gray-100 cursor-pointer">
                <div className="mr-4 text-2xl">{item.icon}</div>
                {isExpanded && <span>{item.label}</span>}
              </a>
            </Link>
          ) : (
            <div
              key={index}
              className="flex items-center py-4 px-6 text-gray-600 hover:bg-gray-100 cursor-pointer"
              onClick={item.action}
            >
              <div className="mr-4 text-2xl">{item.icon}</div>
              {isExpanded && <span>{item.label}</span>}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Sidebar;
