import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiPlus, FiSend } from "react-icons/fi";
import { createBrainstormingSession } from "../api/brainstormingApi";

const BrainstormBuddySessionCreator: React.FC = () => {
  const [inviteLink, setInviteLink] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    try {
      const sessionData = {
        title: data.title,
        description: data.description,
        duration: data.duration,
        mode: data.mode,
        participants: data.participants
          ? data.participants.split(",").map((email: string) => email.trim())
          : [],
      };
      const response = await createBrainstormingSession(sessionData);
      setInviteLink(response.inviteLink);
    } catch (error) {
      console.error("Error creating brainstorming session:", error);
      // Handle error state
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Create Brainstorming Session</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="title" className="block font-medium mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            {...register("title", { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.title && (
            <span className="text-red-500">This field is required</span>
          )}
        </div>
        <div>
          <label htmlFor="description" className="block font-medium mb-1">
            Description
          </label>
          <textarea
            id="description"
            {...register("description", { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
          {errors.description && (
            <span className="text-red-500">This field is required</span>
          )}
        </div>
        <div>
          <label htmlFor="duration" className="block font-medium mb-1">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            {...register("duration", { required: true, min: 1 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.duration && (
            <span className="text-red-500">
              Please enter a valid duration (minimum 1 minute)
            </span>
          )}
        </div>
        <div>
          <label htmlFor="mode" className="block font-medium mb-1">
            Mode
          </label>
          <select
            id="mode"
            {...register("mode", { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
          {errors.mode && (
            <span className="text-red-500">This field is required</span>
          )}
        </div>
        <div>
          <label htmlFor="participants" className="block font-medium mb-1">
            Participants (comma-separated emails)
          </label>
          <input
            type="text"
            id="participants"
            {...register("participants")}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FiPlus className="mr-2" />
          Create Session
        </button>
      </form>
      {inviteLink && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Invite Link</h3>
          <p className="mb-4">{inviteLink}</p>
          <button
            onClick={() => navigator.clipboard.writeText(inviteLink)}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <FiSend className="mr-2" />
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
};

export default BrainstormBuddySessionCreator;
