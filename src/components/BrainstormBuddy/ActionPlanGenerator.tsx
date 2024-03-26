import React, { useState } from "react";
import { FiPlus, FiCheck, FiTrash2 } from "react-icons/fi";

interface ActionPlanGeneratorProps {
  selectedIdeas: any[];
  onTaskCreate: (task: any) => void;
  onTaskUpdate: (taskId: string, updatedTask: any) => void;
  onTaskDelete: (taskId: string) => void;
}

const ActionPlanGenerator: React.FC<ActionPlanGeneratorProps> = ({
  selectedIdeas,
  onTaskCreate,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignee: "",
    dueDate: "",
    status: "todo",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));
  };

  const handleCreateTask = () => {
    if (newTask.title && newTask.description) {
      onTaskCreate(newTask);
      setNewTask({
        title: "",
        description: "",
        assignee: "",
        dueDate: "",
        status: "todo",
      });
    }
  };

  return (
    <div className="action-plan-generator">
      <div className="selected-ideas mb-4">
        <h3 className="text-xl font-semibold mb-2">Selected Ideas</h3>
        <ul className="list-disc pl-6">
          {selectedIdeas.map((idea) => (
            <li key={idea.id}>{idea.title}</li>
          ))}
        </ul>
      </div>
      <div className="task-form mb-4">
        <h3 className="text-xl font-semibold mb-2">Create Task</h3>
        <input
          type="text"
          name="title"
          value={newTask.title}
          onChange={handleInputChange}
          placeholder="Task Title"
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          name="description"
          value={newTask.description}
          onChange={handleInputChange}
          placeholder="Task Description"
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
        <input
          type="text"
          name="assignee"
          value={newTask.assignee}
          onChange={handleInputChange}
          placeholder="Assignee"
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="date"
          name="dueDate"
          value={newTask.dueDate}
          onChange={handleInputChange}
          className="w-full px-3 py-2 mb-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCreateTask}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FiPlus className="inline-block mr-2" />
          Create Task
        </button>
      </div>
      <div className="task-list">
        <h3 className="text-xl font-semibold mb-2">Action Plan</h3>
        <ul>{/* Render tasks */}</ul>
      </div>
    </div>
  );
};

export default ActionPlanGenerator;
