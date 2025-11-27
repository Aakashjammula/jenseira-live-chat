import { createAgent, tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";
import { tavily } from "@tavily/core";
import * as z from "zod";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const LM_STUDIO_API_KEY = process.env.OPENAI_API_KEY || "lm-studio";
const LM_STUDIO_BASE_URL = process.env.OPENAI_API_BASE || "http://localhost:1234/v1";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!TAVILY_API_KEY) {
  console.warn(
    "Warning: TAVILY_API_KEY not set. Search tool will not work."
  );
}

// Initialize the LM Studio model
const model = new ChatOpenAI({
  model: "qwen/qwen3-vl-4b",
  temperature: 0.7,
  configuration: {
    baseURL: LM_STUDIO_BASE_URL,
  },
  apiKey: LM_STUDIO_API_KEY,
  streamUsage: false,
});

// Initialize Tavily
const tvly = tavily({ apiKey: TAVILY_API_KEY });

// Create Tavily search tool
const tavilySearch = tool(
  async ({ query }) => {
    const response = await tvly.search(query);
    
    // Format results
    const results = response.results
      .map((r) => `${r.title}: ${r.content}`)
      .join("\n");
    
    return results;
  },
  {
    name: "tavily_search",
    description: "Search the internet for current information using Tavily. Use this for real-time data, news, or facts.",
    schema: z.object({
      query: z.string().describe("The search query"),
    }),
  }
);

// Create the agent with Tavily search
export const agent = createAgent({
  model,
  tools: [tavilySearch],
  systemPrompt:
    "You are a helpful assistant.your name is Jenseira. Use the tavily_search tool when you need current information. Provide concise, accurate responses in 2-3 sentences.",
});

// Simple wrapper function
export async function getGeminiResponse(userText, systemPrompt) {
  if (!LM_STUDIO_API_KEY) {
    throw new Error(
      "LM Studio API not configured. Please set OPENAI_API_KEY environment variable."
    );
  }

  const result = await agent.invoke({
    messages: [
      {
        role: "user",
        content: `${systemPrompt}\n\nUser input: ${userText}`,
      },
    ],
  });

  // Extract the final message content
  const lastMessage = result.messages[result.messages.length - 1];
  let text = lastMessage.content.toString().trim();

  // Clean up the response
  text = text.replace(/\d+/g, "");
  text = text.replace(/\s+/g, " ");
  text = text.replace(/[^\w\s.,!?;:'"-]/g, "");

  // Ensure 2-3 sentences
  const sentences = text
    .split(/[.!?]+/)
    .filter((s) => s.trim().length > 0);
  if (sentences.length > 3) {
    text = sentences.slice(0, 3).join(". ") + ".";
  } else if (sentences.length < 2) {
    text = sentences[0] || text;
  } else {
    text = sentences.join(". ") + (text.endsWith(".") ? "" : ".");
  }

  return text.trim();
}
