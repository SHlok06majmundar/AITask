import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      system: `You are a helpful AI assistant for SyncSphere, a task management platform. 
      Help users with productivity tips, task organization, time management, and team collaboration. 
      Keep responses concise and actionable. Focus on practical advice for remote teams.`,
      prompt: message,
    })

    return NextResponse.json({ response: text })
  } catch (error) {
    console.error("AI Chat Error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
