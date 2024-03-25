import React from "react";
import Link from "next/link";

interface AgentCardProps {
  title: string;
  description: string;
  link: string;
  className?: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ title, description, link }) => {
  return (
    <Link href={link}>
      <div className="p-6 feature-card rounded-lg shadow-md cursor-pointer hover:bg-solaris-gray hover:text-minimal-white hover:shadow-lg transition-shadow duration-300">
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="">{description}</p>
      </div>
    </Link>
  );
};

export default AgentCard;
