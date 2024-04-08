import React, { useState } from "react";
import { FaTasks } from "react-icons/fa";

interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  status: "todo" | "in-progress" | "done";
}

interface TasksProps {
  projectId: string;
}

const Tasks: React.FC<TasksProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState<Task>({
    id: "",
    title: "",
    description: "",
    assignee: "",
    status: "todo",
  });

  const handleTaskChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = event.target;
    setNewTask((prevTask) => ({ ...prevTask, [name]: value }));
  };

  const handleAddTask = () => {
    const taskId = `task-${Date.now()}`;
    const task = { ...newTask, id: taskId };
    setTasks((prevTasks) => [...prevTasks, task]);
    setNewTask({
      id: "",
      title: "",
      description: "",
      assignee: "",
      status: "todo",
    });
  };

  const handleTaskStatusChange = (
    taskId: string,
    status: "todo" | "in-progress" | "done"
  ) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, status } : task))
    );
  };

  return (
    <div className="tasks">
      <h4>
        <FaTasks /> Tasks
      </h4>
      <div className="task-list">
        {tasks.map((task) => (
          <div key={task.id} className="task-item">
            <h5>{task.title}</h5>
            <p>{task.description}</p>
            <p>Assignee: {task.assignee}</p>
            <div>
              Status:
              <select
                value={task.status}
                onChange={(e) =>
                  handleTaskStatusChange(
                    task.id,
                    e.target.value as "todo" | "in-progress" | "done"
                  )
                }
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <div className="add-task">
        <input
          type="text"
          name="title"
          placeholder="Task Title"
          value={newTask.title}
          onChange={handleTaskChange}
        />
        <textarea
          name="description"
          placeholder="Task Description"
          value={newTask.description}
          onChange={handleTaskChange}
        />
        <input
          type="text"
          name="assignee"
          placeholder="Assignee"
          value={newTask.assignee}
          onChange={handleTaskChange}
        />
        <button onClick={handleAddTask}>Add Task</button>
      </div>
    </div>
  );
};

export default Tasks;
