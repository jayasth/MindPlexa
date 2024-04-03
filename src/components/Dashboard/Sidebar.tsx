// src/components/Dashboard/Sidebar.tsx
import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FiSettings, FiUser, FiGrid, FiMoon, FiSun } from "react-icons/fi";
import { SiVault } from "react-icons/si";
import { GiHiveMind } from "react-icons/gi";
import { RiMindMap } from "react-icons/ri";
import useTheme from "../../shared/hooks/useTheme";

const Sidebar: React.FC = () => {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: FiGrid },
    { href: "/profile", label: "Profile", icon: FiUser },
    { href: "/settings", label: "Settings", icon: FiSettings },
    { href: "/agents/IdeaMapper", label: "Idea Mapper", icon: RiMindMap },
    {
      href: "/agents/BrainstormBuddy",
      label: "Brainstorm Buddy",
      icon: GiHiveMind,
    },
    { href: "/agents/IdeaVault", label: "Idea Vault", icon: SiVault },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md min-h-screen">
      <div className="flex flex-col items-center justify-center pt-8">
        <button
          onClick={toggleTheme}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
        >
          {theme === "light" ? <FiMoon size={24} /> : <FiSun size={24} />}
        </button>
      </div>
      <nav className="mt-8">
        {menuItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} passHref>
            <div
              className={`flex items-center py-2 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                router.pathname === href
                  ? "bg-gray-200 dark:bg-gray-700 font-semibold"
                  : ""
              }`}
            >
              <Icon size={24} className="mr-2" />
              <span className="hidden md:inline-block">{label}</span>
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
