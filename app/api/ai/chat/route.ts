import { streamText } from "ai"
import { google } from "@ai-sdk/google"
import { auth } from "@clerk/nextjs/server"

export async function POST(req: Request) {
  const { userId } = auth()
  if (!userId) {
    return new Response("Unauthorized", { status: 401 })
  }

  const { messages } = await req.json()

  const result = await streamText({
    model: google("gemini-1.5-pro"),
    system: `You are SyncSphere's AI assistant, a smart productivity companion for remote teams. You help with:

1. Task Management: Break down complex tasks, suggest priorities, and optimize workflows
2. Schedule Planning: Organize daily schedules based on deadlines and productivity patterns  
3. Team Insights: Analyze team performance and suggest improvements
4. Natural Language Processing: Convert natural language descriptions into structured tasks

Be helpful, concise, and actionable. Use emojis and formatting to make responses engaging. Focus on productivity and collaboration.`,
    messages,
  })

  return result.toAIStreamResponse()
}
