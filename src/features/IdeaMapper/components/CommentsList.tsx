import React, { useEffect, useState } from "react";
import { supabase } from "../../../shared/utils/supabaseClient";

interface CommentsListProps {
  mindmapId: number;
}

const CommentsList: React.FC<CommentsListProps> = ({ mindmapId }) => {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    const fetchComments = async () => {
      const { data, error } = await supabase
        .from("mindmap_comments")
        .select("id, user_id, content, created_at")
        .eq("mindmap_id", mindmapId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
      } else {
        setComments(data);
      }
    };

    fetchComments();
  }, [mindmapId]);

  return (
    <div>
      <h3 className="text-lg font-bold mb-2">Comments</h3>
      {comments.map((comment) => (
        <div key={comment.id} className="mb-4">
          <p className="text-gray-600 mb-1">User ID: {comment.user_id}</p>
          <p className="text-gray-800">{comment.content}</p>
          <p className="text-gray-500 text-sm">{comment.created_at}</p>
        </div>
      ))}
    </div>
  );
};

export default CommentsList;
