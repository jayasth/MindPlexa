import { NextApiRequest, NextApiResponse } from "next";
import { Client, AgentRun } from "superagi-client";

// Ensure that your API key is being loaded properly
if (!process.env.SUPERAGI_API_KEY) {
  console.error("SUPERAGI_API_KEY is not set in the environment variables");
  throw new Error("SUPERAGI_API_KEY is not set in the environment variables");
}

// Initialize the client with your API key
const superagiClient = new Client({
  apiKey: process.env.SUPERAGI_API_KEY.trim(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const { agentId, inputText } = req.body;

    try {
      // Create an AgentRun object with the goal and instruction
      const agentRun = new AgentRun({
        name: "TextToMindmap",
        goal: ["Generate mind map"],
        instruction: [inputText],
      });

      // Start an agent run with the specific agentId and AgentRun object
      const runAgent = await superagiClient.createAgentRun(agentId, agentRun);

      // Get the run ID from the runAgent object
      const runId = runAgent.id;

      // Wait for the agent run to complete
      let runStatus = await superagiClient.getAgentRunStatus(agentId, runId);
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await superagiClient.getAgentRunStatus(agentId, runId);
      }

      // Get the output from the completed agent run
      const runOutput = await superagiClient.getAgentRunOutput(agentId, runId);
      const result = runOutput.output;

      res.status(200).json({ mindMap: result });
    } catch (error) {
      console.error("Error generating mindmap: ", error);
      res.status(500).json({ error: "Failed to generate mindmap" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
