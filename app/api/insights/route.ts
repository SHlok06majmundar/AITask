import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get user's tasks for analysis
    const tasks = await db.collection("tasks").find({ userId }).toArray()
    const activities = await db.collection("activities").find({ userId }).sort({ timestamp: -1 }).limit(10).toArray()

    // Generate insights based on user data
    const insights = []

    // Task completion insight
    const completedTasks = tasks.filter((task) => task.status === "done").length
    const totalTasks = tasks.length

    if (totalTasks > 0) {
      const completionRate = (completedTasks / totalTasks) * 100
      if (completionRate < 50) {
        insights.push({
          type: "productivity",
          title: "Focus on Task Completion",
          description: `You have ${totalTasks - completedTasks} pending tasks. Consider breaking them into smaller, manageable chunks.`,
          action: "How can I improve my task completion rate?",
        })
      } else if (completionRate > 80) {
        insights.push({
          type: "productivity",
          title: "Excellent Progress!",
          description: `You've completed ${completionRate.toFixed(0)}% of your tasks. Keep up the great work!`,
          action: "Give me tips to maintain this momentum",
        })
      }
    }

    // Priority distribution insight
    const highPriorityTasks = tasks.filter((task) => task.priority === "high" && task.status !== "done").length
    if (highPriorityTasks > 3) {
      insights.push({
        type: "task",
        title: "High Priority Backlog",
        description: `You have ${highPriorityTasks} high-priority tasks pending. Consider focusing on these first.`,
        action: "Help me prioritize my high-priority tasks",
      })
    }

    // Recent activity insight
    if (activities.length > 0) {
      const recentActivity = activities[0]
      const timeSinceLastActivity = Date.now() - new Date(recentActivity.timestamp).getTime()
      const hoursSinceLastActivity = timeSinceLastActivity / (1000 * 60 * 60)

      if (hoursSinceLastActivity > 24) {
        insights.push({
          type: "schedule",
          title: "Stay Active",
          description: "It's been a while since your last task update. Regular check-ins help maintain momentum.",
          action: "Show me my schedule for today",
        })
      }
    }

    // Team collaboration insight
    const teamTasks = tasks.filter((task) => task.assignee && task.assignee !== userId).length
    if (teamTasks > 0) {
      insights.push({
        type: "team",
        title: "Team Collaboration",
        description: `You have ${teamTasks} tasks involving team members. Regular communication is key to success.`,
        action: "Give me team collaboration tips",
      })
    }

    // Default insights if no specific patterns found
    if (insights.length === 0) {
      insights.push(
        {
          type: "productivity",
          title: "Optimize Your Workflow",
          description: "Consider implementing time-blocking to improve focus and productivity.",
          action: "Teach me about time-blocking techniques",
        },
        {
          type: "task",
          title: "Task Organization",
          description: "Regular task reviews help maintain clarity and prevent overwhelm.",
          action: "How should I organize my tasks?",
        },
      )
    }

    return NextResponse.json(insights.slice(0, 4)) // Return max 4 insights
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
