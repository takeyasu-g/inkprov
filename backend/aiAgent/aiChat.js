import client from "../utils/openAIClient.js";
import persona from "./agentPersona.js";

async function getWritingSuggestions(prompt) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      // Persona for AI Agent
      {
        role: "developer",
        content: persona,
      },
      // User's prompt (Most Recent Contribution)
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  //  AI response
  return response.choices[0].message.content;
}

export default getWritingSuggestions;
