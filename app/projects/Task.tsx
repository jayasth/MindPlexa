import { Tasks } from '@/types/database/tasks';

type Task = Tasks['Row'];

interface TaskProps {
  task: Task;
}

const Task: React.FC<TaskProps> = ({ task }) => {
  return (
    <div className="p-4 mb-4 bg-white rounded-md shadow">
      <h3 className="text-lg font-bold">{task.title}</h3>
      <p className="text-gray-600">{task.description}</p>
      {/* Add more task details */}
    </div>
  );
};

export default Task;
