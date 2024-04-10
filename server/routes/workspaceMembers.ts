import { Request, Response } from 'express';
import { createClient } from '@/utils/supabase/supabaseServer';

export default async function workspaceMembersRoute(
  req: Request,
  res: Response
) {
  const supabase = createClient();

  switch (req.method) {
    case 'GET':
      // Get all workspace members
      const { workspaceId } = req.query;
      const { data: members, error: getError } = await supabase
        .from('workspace_members')
        .select('*')
        .eq('workspace_id', workspaceId);

      if (getError) {
        return res.status(500).json({ error: getError.message });
      }

      return res.status(200).json(members);

    case 'POST':
      // Add a new workspace member
      const { userId, role } = req.body;
      const { data: newMember, error: createError } = await supabase
        .from('workspace_members')
        .insert({ user_id: userId, workspace_id: workspaceId, role })
        .single();

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }

      return res.status(201).json(newMember);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
