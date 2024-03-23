import { Client } from "superagi-client";

const superagiClient = new Client({
  apiKey: process.env.SUPERAGI_API_KEY, // Server-side only
});

export default superagiClient;
