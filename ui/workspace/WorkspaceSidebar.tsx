import React from 'react';
import Link from 'next/link';
import { FaThLarge, FaChartBar, FaPlus, FaCog } from 'react-icons/fa';

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
      className={`bg-white dark:bg-gray-800 h-full fixed top-0 left-0 transition-all duration-300 ease-in-out ${isOpen ? 'w-64' : 'w-16'} shadow-lg`}
    >
      <div className="flex justify-between items-center p-4">
        <h2 className={`text-xl font-bold ${isOpen ? 'block' : 'hidden'}`}>
          Workspace
        </h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          {isOpen ? '<<' : '>>'}
        </button>
      </div>
      <nav className="mt-8">
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
          href="/dashboard/settings"
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
  <Link
    href={href}
    className="flex items-center p-4 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
  >
    <span className="mr-4">{icon}</span>
    {isOpen && <span>{text}</span>}
  </Link>
);

export default WorkspaceSidebar;
