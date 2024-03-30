import React, { useState } from "react";
import { supabase } from "../../../utils/supabaseClient";

interface CommentInputProps {
  mindmapId: number;
  userId: string;
  onCommentAdded: () => void;
}

const CommentInput: React.FC<CommentInputProps> = ({
  mindmapId,
  userId,
  onCommentAdded,
}) => {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      const { error } = await supabase
        .from("mindmap_comments")
        .insert({ mindmap_id: mindmapId, user_id: userId, content });

      if (error) {
        console.error("Error adding comment:", error);
      } else {
        setContent("");
        onCommentAdded();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Leave a comment..."
        className="w-full border border-gray-300 rounded p-2 mb-2"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white rounded px-4 py-2"
      >
        Add Comment
      </button>
    </form>
  );
};

export default CommentInput;
