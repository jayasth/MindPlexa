import React, { useState } from "react";
import { FaFlag } from "react-icons/fa";

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
}

interface ProjectMilestonesProps {
  projectId: string;
}

const ProjectMilestones: React.FC<ProjectMilestonesProps> = ({ projectId }) => {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newMilestone, setNewMilestone] = useState<Milestone>({
    id: "",
    title: "",
    description: "",
    dueDate: "",
  });

  const handleMilestoneChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setNewMilestone((prevMilestone) => ({ ...prevMilestone, [name]: value }));
  };

  const handleAddMilestone = () => {
    const milestoneId = `milestone-${Date.now()}`;
    const milestone = { ...newMilestone, id: milestoneId };
    setMilestones((prevMilestones) => [...prevMilestones, milestone]);
    setNewMilestone({
      id: "",
      title: "",
      description: "",
      dueDate: "",
    });
  };

  return (
    <div className="project-milestones">
      <h4>
        <FaFlag /> Project Milestones
      </h4>
      <div className="milestone-list">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="milestone-item">
            <h5>{milestone.title}</h5>
            <p>{milestone.description}</p>
            <p>Due Date: {milestone.dueDate}</p>
          </div>
        ))}
      </div>
      <div className="add-milestone">
        <input
          type="text"
          name="title"
          placeholder="Milestone Title"
          value={newMilestone.title}
          onChange={handleMilestoneChange}
        />
        <textarea
          name="description"
          placeholder="Milestone Description"
          value={newMilestone.description}
          onChange={handleMilestoneChange}
        />
        <input
          type="date"
          name="dueDate"
          placeholder="Due Date"
          value={newMilestone.dueDate}
          onChange={handleMilestoneChange}
        />
        <button onClick={handleAddMilestone}>Add Milestone</button>
      </div>
    </div>
  );
};

export default ProjectMilestones;
