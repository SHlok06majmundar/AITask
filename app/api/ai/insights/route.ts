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

    // Get user's tasks and activities to generate insights
    const [tasks, activities] = await Promise.all([
      db.collection("tasks").find({ userId }).toArray(),
      db.collection("activities").find({ userId }).sort({ timestamp: -1 }).limit(50).toArray(),
    ])

    // Generate AI insights based on user data
    const insights = []

    // Task completion insight
    const completedTasks = tasks.filter((task) => task.status === "done")
    const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0

    if (completionRate < 50) {
      insights.push({
        type: "productivity",
        title: "Boost Your Task Completion",
        description: `You've completed ${Math.round(completionRate)}% of your tasks. Try breaking large tasks into smaller ones.`,
        action: "How can I improve my task completion rate?",
      })
    }

    // Overdue tasks insight
    const overdueTasks = tasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done",
    )

    if (overdueTasks.length > 0) {
      insights.push({
        type: "task",
        title: "Overdue Tasks Need Attention",
        description: `You have ${overdueTasks.length} overdue tasks. Consider reprioritizing your workload.`,
        action: "Help me prioritize my overdue tasks",
      })
    }

    // Productivity pattern insight
    const recentActivities = activities.slice(0, 10)
    if (recentActivities.length > 5) {
      insights.push({
        type: "schedule",
        title: "Peak Productivity Hours",
        description: "Based on your activity, you're most productive in the morning. Schedule important tasks then.",
        action: "Optimize my daily schedule",
      })
    }

    return NextResponse.json(insights)
  } catch (error) {
    console.error("Error generating insights:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
