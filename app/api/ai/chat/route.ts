import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return new Response("Unauthorized", { status: 401 })
    }

    const { messages } = await req.json()

    const result = streamText({
      model: google("gemini-1.5-flash"),
      system: `You are an AI assistant for SyncSphere, a task management platform. 
      Help users with:
      - Task organization and prioritization
      - Productivity tips and strategies
      - Team collaboration advice
      - Time management techniques
      - Project planning guidance
      
      Keep responses helpful, concise, and focused on productivity and task management.`,
      messages,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in AI chat:", error)
    return new Response("Internal Server Error", { status: 500 })
  }
}
