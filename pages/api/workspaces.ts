// client\src\pages\api\workspaces.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { createPagesServerClient } from '@/utils/auth-helpers-nextjs';
import { definitions } from '@/types/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseServerClient = createPagesServerClient<definitions>({
    req,
    res
  });
  const { method } = req;

  switch (method) {
    case 'GET':
      // Retrieve workspaces for the authenticated user
      const { data: workspaces, error: getError } = await supabaseServerClient
        .from('workspaces')
        .select('*')
        .eq('owner_id', supabaseServerClient.auth.user()?.id);

      if (getError) {
        return res.status(500).json({ error: getError.message });
      }

      return res.status(200).json(workspaces);

    case 'POST':
      // Create a new workspace for the authenticated user
      const { name, description } = req.body;
      const { data: newWorkspace, error: createError } =
        await supabaseServerClient
          .from('workspaces')
          .insert({
            name,
            description,
            owner_id: supabaseServerClient.auth.user()?.id
          })
          .single();

      if (createError) {
        return res.status(500).json({ error: createError.message });
      }

      return res.status(201).json(newWorkspace);

    case 'PUT':
      // Update an existing workspace for the authenticated user
      const {
        id,
        name: updatedName,
        description: updatedDescription
      } = req.body;
      const { data: updatedWorkspace, error: updateError } =
        await supabaseServerClient
          .from('workspaces')
          .update({ name: updatedName, description: updatedDescription })
          .eq('id', id)
          .eq('owner_id', supabaseServerClient.auth.user()?.id)
          .single();

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json(updatedWorkspace);

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
