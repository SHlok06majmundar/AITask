import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get comprehensive user data
    const [userProfile, tasks, teamTasks, activities, teamMembers] = await Promise.all([
      db.collection("profiles").findOne({ userId }),
      db.collection("tasks").find({ userId }).toArray(),
      db.collection("team_tasks").find({ $or: [{ assignedTo: userId }, { createdBy: userId }] }).toArray(),
      db.collection("activities").find({ userId }).sort({ timestamp: -1 }).limit(100).toArray(),
      db.collection("team_members").find({ $or: [{ userId }, { teamId: userId }] }).toArray(),
    ])

    const insights = []

    // Basic analytics for fallback
    const allUserTasks = [...tasks, ...teamTasks]
    const completedTasks = allUserTasks.filter(task => task.status === "completed" || task.status === "done")
    const completionRate = allUserTasks.length > 0 ? (completedTasks.length / allUserTasks.length) * 100 : 0
    const overdueTasks = allUserTasks.filter(
      task => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "completed" && task.status !== "done"
    )

    // Enhanced AI insights using Gemini
    if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      try {
        const userName = userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "User"
        
        const contextData = {
          userName,
          totalTasks: allUserTasks.length,
          completedTasks: completedTasks.length,
          completionRate: Math.round(completionRate),
          overdueTasks: overdueTasks.length,
          teamSize: teamMembers.length,
          recentActivities: activities.slice(0, 10).map(a => ({ action: a.action, timestamp: a.timestamp })),
          tasksByStatus: {
            todo: allUserTasks.filter(t => t.status === "todo" || t.status === "to-do").length,
            inProgress: allUserTasks.filter(t => t.status === "in-progress" || t.status === "in_progress").length,
            review: allUserTasks.filter(t => t.status === "review").length,
            completed: completedTasks.length
          },
          tasksByPriority: {
            high: allUserTasks.filter(t => t.priority === "high" || t.priority === "urgent").length,
            medium: allUserTasks.filter(t => t.priority === "medium").length,
            low: allUserTasks.filter(t => t.priority === "low").length
          }
        }

        const prompt = `As an AI productivity analyst, analyze this user's data and provide 3-4 specific, actionable insights for ${userName}:

User Data:
- Total Tasks: ${contextData.totalTasks}
- Completed: ${contextData.completedTasks} (${contextData.completionRate}% completion rate)
- Overdue: ${contextData.overdueTasks}
- Team Size: ${contextData.teamSize}
- Tasks by Status: ${JSON.stringify(contextData.tasksByStatus)}
- Tasks by Priority: ${JSON.stringify(contextData.tasksByPriority)}

Please provide insights in this exact JSON format:
[
  {
    "type": "productivity|task|schedule|team",
    "title": "Brief insight title",
    "description": "Detailed description with specific recommendations",
    "action": "Specific actionable suggestion"
  }
]

Focus on:
1. Task completion patterns and improvements
2. Priority management optimization
3. Time management suggestions
4. Team collaboration opportunities
5. Workflow efficiency improvements

Make insights specific, actionable, and professional. Each description should be 1-2 sentences with concrete advice.`

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
        const result = await model.generateContent(prompt)
        let aiResponse = result.response.text()

        // Clean up the response to extract JSON
        aiResponse = aiResponse.replace(/```json\n?/, '').replace(/\n?```/, '').trim()
        
        try {
          const aiInsights = JSON.parse(aiResponse)
          insights.push(...aiInsights)
        } catch (parseError) {
          console.error("Error parsing AI insights:", parseError)
          // Fall through to manual insights
        }
      } catch (aiError) {
        console.error("Error generating AI insights:", aiError)
        // Fall through to manual insights
      }
    }

    // Fallback manual insights if AI fails or no API key
    if (insights.length === 0) {
      if (completionRate < 50) {
        insights.push({
          type: "productivity",
          title: "Boost Your Task Completion",
          description: `You've completed ${Math.round(completionRate)}% of your tasks. Try breaking large tasks into smaller, manageable chunks and set daily completion goals.`,
          action: "How can I improve my task completion rate?"
        })
      }

      if (overdueTasks.length > 0) {
        insights.push({
          type: "task",
          title: "Overdue Tasks Need Attention",
          description: `You have ${overdueTasks.length} overdue tasks. Consider using the Eisenhower Matrix to prioritize urgent vs important tasks.`,
          action: "Help me prioritize my overdue tasks"
        })
      }

      if (activities.length > 10) {
        insights.push({
          type: "schedule",
          title: "Optimize Your Productive Hours",
          description: "Track your energy levels throughout the day and schedule your most important tasks during peak productivity hours.",
          action: "Optimize my daily schedule"
        })
      }

      if (teamMembers.length > 1) {
        insights.push({
          type: "team",
          title: "Enhance Team Collaboration",
          description: "With your team of " + teamMembers.length + " members, establish regular check-ins and clear communication channels to improve collaboration.",
          action: "Improve team communication strategies"
        })
      }
    }

    // Ensure we have at least 2 insights
    if (insights.length < 2) {
      insights.push({
        type: "productivity",
        title: "Productivity System Optimization",
        description: "Consider implementing a productivity framework like Getting Things Done (GTD) or the PARA method to organize your tasks more effectively.",
        action: "Set up a productivity system"
      })
    }

    return NextResponse.json(insights.slice(0, 4)) // Return max 4 insights
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
