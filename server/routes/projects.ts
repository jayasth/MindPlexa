// C:/coding/MindPlexa/server/routes/projects.ts

import { Request, Response } from 'express';
import { createClient } from '@/utils/supabase/supabaseServer';

export default async function projectsRoute(req: Request, res: Response) {
  const supabase = createClient();

  switch (req.method) {
    case 'GET':
      // Get all projects
      const { data: projects, error: getError } = await supabase
        .from('projects')
        .select('*');

      if (getError) {
        return res.status(500).json({ error: getError.message });
      }

      return res.status(200).json(projects);

    case 'POST':
      // Create a new project
      const { name, description } = req.body;
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({ name, description })
        .single();

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }

      return res.status(201).json(newProject);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
