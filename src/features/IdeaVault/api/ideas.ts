import type { NextApiRequest, NextApiResponse } from "next";
import withAuth from "../../../components/withAuth";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    try {
      // Fetch ideas from the database based on the authenticated user
      const ideas = [
        {
          id: 1,
          title: "Idea 1",
          description: "Description of idea 1",
        },
        {
          id: 2,
          title: "Idea 2",
          description: "Description of idea 2",
        },
      ];

      res.status(200).json(ideas);
    } catch (error) {
      console.error("Error fetching ideas:", error);
      res.status(500).json({ message: "Error fetching ideas" });
    }
  } else if (req.method === "POST") {
    try {
      const { title, description } = req.body;
      // Save the idea to the database or perform any necessary processing
      // Example:
      const savedIdea = {
        id: "123",
        title: title || "Untitled Idea",
        description: description || "",
      };

      res.status(201).json(savedIdea);
    } catch (error) {
      console.error("Error saving idea:", error);
      res.status(500).json({ message: "Error saving idea" });
    }
  } else if (req.method === "DELETE") {
    try {
      const { ideaId } = req.query;
      // Delete the idea from the database based on the ideaId
      // Example:
      // await deleteIdeaFromDatabase(ideaId);

      res.status(204).end();
    } catch (error) {
      console.error("Error deleting idea:", error);
      res.status(500).json({ message: "Error deleting idea" });
    }
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
};

export default withAuth(handler);
