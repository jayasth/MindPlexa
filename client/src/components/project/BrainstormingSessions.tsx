import React, { useState } from "react";
import { FaLightbulb } from "react-icons/fa";

interface BrainstormingSession {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
}

interface BrainstormingSessionsProps {
  projectId: string;
}

const BrainstormingSessions: React.FC<BrainstormingSessionsProps> = ({
  projectId,
}) => {
  const [sessions, setSessions] = useState<BrainstormingSession[]>([]);
  const [newSession, setNewSession] = useState<BrainstormingSession>({
    id: "",
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });

  const handleSessionChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setNewSession((prevSession) => ({ ...prevSession, [name]: value }));
  };

  const handleAddSession = () => {
    const sessionId = `session-${Date.now()}`;
    const session = { ...newSession, id: sessionId };
    setSessions((prevSessions) => [...prevSessions, session]);
    setNewSession({
      id: "",
      title: "",
      description: "",
      startTime: "",
      endTime: "",
    });
  };

  return (
    <div className="brainstorming-sessions">
      <h4>
        <FaLightbulb /> Brainstorming Sessions
      </h4>
      <div className="session-list">
        {sessions.map((session) => (
          <div key={session.id} className="session-item">
            <h5>{session.title}</h5>
            <p>{session.description}</p>
            <p>Start Time: {session.startTime}</p>
            <p>End Time: {session.endTime}</p>
          </div>
        ))}
      </div>
      <div className="add-session">
        <input
          type="text"
          name="title"
          placeholder="Session Title"
          value={newSession.title}
          onChange={handleSessionChange}
        />
        <textarea
          name="description"
          placeholder="Session Description"
          value={newSession.description}
          onChange={handleSessionChange}
        />
        <input
          type="datetime-local"
          name="startTime"
          placeholder="Start Time"
          value={newSession.startTime}
          onChange={handleSessionChange}
        />
        <input
          type="datetime-local"
          name="endTime"
          placeholder="End Time"
          value={newSession.endTime}
          onChange={handleSessionChange}
        />
        <button onClick={handleAddSession}>Add Session</button>
      </div>
    </div>
  );
};

export default BrainstormingSessions;
