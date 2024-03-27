// src/components/Onboarding/OnboardingTutorial.tsx

import React, { useState } from "react";
import { useRouter } from "next/router";

const OnboardingTutorial: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to MindPlexa",
      content:
        "MindPlexa is an AI-powered web application that helps you generate, organize, and share ideas effortlessly.",
    },
    {
      title: "Idea Mapper",
      content:
        "Use the Idea Mapper to create visually stunning mind maps. Generate ideas with the help of AI and collaborate with your team in real-time.",
    },
    {
      title: "Brainstorm Buddy",
      content:
        "Brainstorm Buddy enables you to host and participate in brainstorming sessions. Submit ideas, vote on them, and generate action items.",
    },
    {
      title: "Idea Vault",
      content:
        "The Idea Vault is a central repository for storing and managing your ideas. Easily save your mind maps and brainstorming sessions for later reference.",
    },
  ];

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      router.push("/");
    } else {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">{steps[currentStep].title}</h2>
      <p className="mb-8">{steps[currentStep].content}</p>
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep((prevStep) => prevStep - 1)}
          disabled={currentStep === 0}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
