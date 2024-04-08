import React from "react";

const OnboardingTutorial: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md max-w-md mx-auto">
        <h2 className="text-2xl font-semibold mb-4">MindPlexa</h2>
        <p className="text-gray-600 mb-8">
          Navigating Ideas from Conception to Completion
        </p>
      </div>
    </div>
  );
};

export default OnboardingTutorial;
