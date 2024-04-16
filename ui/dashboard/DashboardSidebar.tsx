import React, { useState } from 'react';
import Link from 'next/link';
import {
  FaFolder,
  FaUser,
  FaCog,
  FaSignOutAlt,
  FaRegClone,
  FaTimes
} from 'react-icons/fa';
import { MdDashboard, MdAccountBox, MdWorkspaces } from 'react-icons/md';
import { SignOut } from '@/utils/auth-helpers/authServer';
import { handleRequest } from '@/utils/auth-helpers/authClient';
import { useRouter } from 'next/navigation';

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  isOpen,
  onClose
}) => {
  const router = useRouter();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleSignOut = async (e: React.MouseEvent) => {
    e.preventDefault();
    const syntheticEvent = {
      preventDefault: () => {},
      target: { elements: { pathName: { value: router.refresh } } }
    };
    await handleRequest(syntheticEvent as any, SignOut, router);
  };

  const menuItems = [
    { icon: <MdDashboard />, label: 'Dashboard', link: '/dashboard' },
    { icon: <MdWorkspaces />, label: 'Workspace', link: '/workspace' },
    { icon: <FaUser />, label: 'Profile', link: '/dashboard/profile' },
    { icon: <MdAccountBox />, label: 'Settings', link: '/dashboard/settings' },
    { icon: <FaCog />, label: 'Account', link: '/dashboard/account' },
    { icon: <FaSignOutAlt />, label: 'Sign Out', action: handleSignOut }
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-20 w-12 bg-myLightGray-600 transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 md:w-48`}
    >
      <div className="flex h-full flex-col p-4">
        <div className="flex items-center justify-between">
          <button
            className="md:hidden text-gary-400 hover:text-white focus:outline-none"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <nav className="flex-1 mt-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) =>
              item.link ? (
                <li
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <Link
                    href={item.link}
                    className="flex justify-center items-center space-x-2 rounded px-2 py-2 hover:bg-myLightGray-700"
                    onClick={onClose}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span
                      className={`${
                        hoveredIndex === index ? 'inline' : 'hidden'
                      } md:hidden absolute left-8 bg-myLightGray-700 text-lavender-500 px-2 py-1 rounded text-xs whitespace-nowrap`}
                    >
                      {item.label}
                    </span>
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                </li>
              ) : (
                <li
                  key={index}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <button
                    className="flex justify-center items-center space-x-2 rounded px-2 py-2 hover:bg-myLightGray-700 w-full"
                    onClick={(e) => {
                      item.action;
                      onClose();
                    }}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span
                      className={`${
                        hoveredIndex === index ? 'inline' : 'hidden'
                      } md:hidden absolute left-12 bg-myLightGray-700 text-white px-2 py-1 rounded text-xs whitespace-nowrap`}
                    >
                      {item.label}
                    </span>
                    <span className="hidden md:inline">{item.label}</span>
                  </button>
                </li>
              )
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default DashboardSidebar;
