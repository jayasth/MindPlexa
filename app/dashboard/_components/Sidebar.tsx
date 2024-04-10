'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FaHome, FaFolder, FaUser, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    { icon: <FaHome />, label: 'Dashboard', link: '/dashboard' },
    { icon: <FaFolder />, label: 'Projects', link: '/projects' },
    { icon: <FaUser />, label: 'Profile', link: '/profile' },
    { icon: <FaCog />, label: 'Settings', link: '/settings' },
    { icon: <FaSignOutAlt />, label: 'Logout', link: '/logout' }
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
        {menuItems.map((item, index) => (
          <Link key={index} href={item.link}>
            <div className="flex items-center py-4 px-6 text-gray-600 hover:bg-gray-100">
              <div className="mr-4 text-2xl">{item.icon}</div>
              {isExpanded && <span>{item.label}</span>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
