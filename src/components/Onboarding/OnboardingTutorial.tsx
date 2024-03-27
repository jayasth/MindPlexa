// src/components/Onboarding/OnboardingTutorial.tsx
import React, { useState } from "react";
import { FiArrowRight, FiArrowLeft, FiCheck } from "react-icons/fi";

const OnboardingTutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to MindPlexa",
      content:
        "MindPlexa is an AI-powered ideation tool that helps you generate, organize, and share ideas effortlessly.",
    },
    {
      title: "IdeaMapper",
      content:
        "Use the IdeaMapper to create visual mind maps, brainstorm ideas, and collaborate with your team in real-time.",
    },
    {
      title: "BrainstormBuddy",
      content:
        "Engage in interactive brainstorming sessions with BrainstormBuddy. Submit ideas, vote on them, and generate actionable insights.",
    },
    {
      title: "IdeaVault",
      content:
        "Store and manage your ideas securely in the IdeaVault. Easily search, filter, and organize your ideas for future reference.",
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      // TODO: Redirect to the main app or close the onboarding tutorial
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prevStep) => prevStep - 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4">
          {steps[currentStep].title}
        </h2>
        <p className="text-gray-600 mb-8">{steps[currentStep].content}</p>
        <div className="flex justify-between">
          {currentStep > 0 && (
            <button
              onClick={handlePrev}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 focus:outline-none"
            >
              <FiArrowLeft className="inline-block mr-2" />
              Prev
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none"
          >
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <FiArrowRight className="inline-block ml-2" />
              </>
            ) : (
              <>
                Finish
                <FiCheck className="inline-block ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
