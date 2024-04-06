// client\src\pages\api\projects.ts

import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { definitions } from "@/types/supabase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const supabaseServerClient = createPagesServerClient<definitions>({
    req,
    res,
  });
  const { method } = req;

  switch (method) {
    case "GET":
      // Retrieve a project by ID
      const { id } = req.query;
      const { data: project, error: getError } = await supabaseServerClient
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (getError) {
        return res.status(500).json({ error: getError.message });
      }

      return res.status(200).json(project);

    case "PUT":
      // Update a project
      const { id: projectId, nodes, edges } = req.body;
      const { data: updatedProject, error: updateError } =
        await supabaseServerClient
          .from("projects")
          .update({ nodes, edges })
          .eq("id", projectId)
          .single();

      if (updateError) {
        return res.status(500).json({ error: updateError.message });
      }

      return res.status(200).json(updatedProject);

    default:
      return res.status(405).json({ error: "Method not allowed" });
  }
}
