import { Request, Response } from 'express';
import { createClient } from '@/utils/supabase/supabaseServer';

export default async function nodesRoute(req: Request, res: Response) {
  const supabase = createClient();

  switch (req.method) {
    case 'GET':
      // Get all nodes for a project
      const { projectId } = req.query;
      const { data: nodes, error: getError } = await supabase
        .from('nodes')
        .select('*')
        .eq('project_id', projectId);

      if (getError) {
        return res.status(500).json({ error: getError.message });
      }

      return res.status(200).json(nodes);

    case 'POST':
      // Create a new node
      const { title, content } = req.body;
      const { data: newNode, error: createError } = await supabase
        .from('nodes')
        .insert({ title, content, project_id: projectId })
        .single();

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }

      return res.status(201).json(newNode);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
