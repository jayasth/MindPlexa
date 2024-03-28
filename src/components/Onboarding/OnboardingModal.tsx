// src/components/Onboarding/OnboardingModal.tsx
import React, { useState } from "react";
import { FiX } from "react-icons/fi";

const OnboardingModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    // TODO: Mark the onboarding as completed in the user's preferences
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded shadow-lg max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Welcome to MindPlexa</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <FiX size={24} />
          </button>
        </div>
        <p className="text-gray-600 mb-4">
          MindPlexa is an AI-powered ideation tool that helps you generate,
          organize, and share ideas effortlessly.
        </p>
        <ul className="list-disc pl-5 mb-4">
          <li className="mb-2">
            Use the IdeaMapper to create visual mind maps and brainstorm ideas.
          </li>
          <li className="mb-2">
            Engage in interactive brainstorming sessions with BrainstormBuddy.
          </li>
          <li>
            Store and manage your ideas securely in the IdeaVault for future
            reference.
          </li>
        </ul>
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default OnboardingModal;
