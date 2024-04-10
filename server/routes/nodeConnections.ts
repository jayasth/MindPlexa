import { Request, Response } from 'express';
import { createClient } from '@/utils/supabase/supabaseServer';

export default async function nodeConnectionsRoute(
  req: Request,
  res: Response
) {
  const supabase = createClient();

  switch (req.method) {
    case 'GET':
      // Get all node connections for a project
      const { projectId } = req.query;
      const { data: connections, error: getError } = await supabase
        .from('node_connections')
        .select('*')
        .eq('project_id', projectId);

      if (getError) {
        return res.status(500).json({ error: getError.message });
      }

      return res.status(200).json(connections);

    case 'POST':
      // Create a new node connection
      const { sourceNodeId, targetNodeId } = req.body;
      const { data: newConnection, error: createError } = await supabase
        .from('node_connections')
        .insert({
          source_node_id: sourceNodeId,
          target_node_id: targetNodeId,
          project_id: projectId
        })
        .single();

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }

      return res.status(201).json(newConnection);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
