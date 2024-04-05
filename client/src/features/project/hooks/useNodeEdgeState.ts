// C:/coding/mindplexa/src/features/IdeaMapper/hooks/useNodesAndEdges.ts

import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../services/api/supabase/supabaseClient";
import { Node, Edge } from "reactflow";

export const useNodesAndEdges = (userId: string) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const saveNodesAndEdges = async () => {
    const { error } = await supabase
      .from("mindmaps")
      .upsert({ user_id: userId, nodes, edges });

    if (error) console.error("Error saving nodes and edges:", error);
  };

  const loadNodesAndEdges = useCallback(async () => {
    const { data: mindmaps, error } = await supabase
      .from("mindmaps")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) console.error("Error loading nodes and edges:", error);
    else {
      setNodes(mindmaps?.nodes || []);
      setEdges(mindmaps?.edges || []);
    }
  }, [userId]);

  useEffect(() => {
    loadNodesAndEdges();
  }, [loadNodesAndEdges]);

  // Add more CRUD operations as needed...

  return { nodes, edges, setNodes, setEdges, saveNodesAndEdges };
};
