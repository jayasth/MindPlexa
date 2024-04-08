import React, { useState } from "react";
import { FaComment } from "react-icons/fa";

interface CommentsProps {
  nodeId?: string;
  projectId: string;
}

const Comments: React.FC<CommentsProps> = ({ nodeId, projectId }) => {
  const [comments, setComments] = useState<{ id: string; content: string }[]>(
    []
  );
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim() !== "") {
      const commentId = `comment-${Date.now()}`;
      const comment = { id: commentId, content: newComment };
      setComments([...comments, comment]);
      setNewComment("");

      // Emit a socket event to add the comment on the server-side
      // socket.emit('addComment', { projectId, nodeId, commentId, content: newComment });
    }
  };

  return (
    <div className="comments">
      <h4>
        <FaComment /> Comments
      </h4>
      <div className="comment-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <p>{comment.content}</p>
          </div>
        ))}
      </div>
      <div className="add-comment">
        <input
          type="text"
          placeholder="Add a comment"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button onClick={handleAddComment}>Add</button>
      </div>
    </div>
  );
};

export default Comments;
