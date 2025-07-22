import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { getDatabase } from "@/lib/mongodb"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()

    if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 })
    }

    // Get user context from database
    const db = await getDatabase()
    const userProfile = await db.collection("profiles").findOne({ userId })
    const teamMembers = await db.collection("team_members").find({ 
      $or: [{ userId }, { teamId: userId }] 
    }).toArray()
    const tasks = await db.collection("team_tasks").find({
      $or: [{ assignedTo: userId }, { createdBy: userId }]
    }).toArray()

    // Build context for AI
    const userName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "User"
    const teamSize = teamMembers.length
    const taskCount = tasks.length
    const completedTasks = tasks.filter(t => t.status === "completed").length
    const pendingTasks = taskCount - completedTasks

    const systemPrompt = `You are an advanced AI productivity assistant for SyncSphere, a professional task management and team collaboration platform. You're helping ${userName}.

CONTEXT:
- User: ${userName}
- Team size: ${teamSize} members
- Total tasks: ${taskCount} (${completedTasks} completed, ${pendingTasks} pending)
- Platform: SyncSphere - Task Management & Team Collaboration

CAPABILITIES:
- Task management and prioritization strategies
- Team collaboration and project management advice
- Time management and productivity optimization
- Workflow automation suggestions
- Team communication strategies
- Project planning and resource allocation
- Analytics and performance insights
- Custom solutions for specific business needs

PERSONALITY:
- Professional yet friendly
- Actionable and practical advice
- Encourage productivity and efficiency
- Provide specific, detailed recommendations
- Ask follow-up questions to better understand needs
- Use bullet points and clear formatting
- Be encouraging and supportive

INSTRUCTIONS:
- Always provide detailed, actionable advice
- Suggest specific techniques and methodologies
- Offer multiple solutions when possible
- Ask clarifying questions to better help
- Reference the user's context when relevant
- Provide examples and step-by-step guidance
- Be comprehensive but concise
- Format responses with clear structure and bullet points

Respond to user queries with detailed, professional productivity advice. Always aim to be helpful, practical, and encouraging.`

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    })

    const result = await model.generateContent(message)
    const response = result.response.text()

    // Log the interaction for future improvements
    await db.collection("chat_logs").insertOne({
      userId,
      message,
      response,
      timestamp: new Date(),
      context: {
        teamSize,
        taskCount,
        completedTasks,
        pendingTasks
      }
    })

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chat:", error)
    
    // Fallback response if AI fails
    const fallbackResponse = `I'm here to help you with productivity and team management! I can assist with:

• **Task Management**: Prioritization, organization, and tracking
• **Team Collaboration**: Communication strategies and workflow optimization  
• **Time Management**: Scheduling, time-blocking, and efficiency techniques
• **Project Planning**: Resource allocation and milestone planning
• **Productivity Systems**: GTD, Kanban, Agile, and custom methodologies

What specific challenge would you like help with today?`

    return NextResponse.json({ response: fallbackResponse })
  }
}
