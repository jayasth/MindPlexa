import { Request, Response } from 'express';
import { createClient } from '@/utils/supabase/supabaseServer';

export default async function workspacesRoute(req: Request, res: Response) {
  const supabase = createClient();

  switch (req.method) {
    case 'GET':
      // Get all workspaces
      const { data: workspaces, error: getError } = await supabase
        .from('workspaces')
        .select('*');

      if (getError) {
        return res.status(500).json({ error: getError.message });
      }

      return res.status(200).json(workspaces);

    case 'POST':
      // Create a new workspace
      const { name, description } = req.body;
      const { data: newWorkspace, error: createError } = await supabase
        .from('workspaces')
        .insert({ name, description })
        .single();

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }

      return res.status(201).json(newWorkspace);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
