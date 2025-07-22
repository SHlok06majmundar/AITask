import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") || "7d"

    const db = await getDatabase()

    // Calculate date range
    const now = new Date()
    const daysBack = range === "30d" ? 30 : range === "90d" ? 90 : 7
    const startDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)

    // Get tasks data
    const tasks = await db.collection("tasks").find({ userId }).toArray()
    const recentTasks = tasks.filter((task) => new Date(task.createdAt) >= startDate)

    // Get team members count
    const teamMembers = await db.collection("team_members").countDocuments({ teamId: userId })

    // Calculate metrics
    const totalTasks = recentTasks.length
    const completedTasks = recentTasks.filter((task) => task.status === "done").length
    const inProgressTasks = recentTasks.filter((task) => task.status === "in-progress").length
    const overdueTasks = recentTasks.filter((task) => {
      if (!task.dueDate) return false
      return new Date(task.dueDate) < now && task.status !== "done"
    }).length

    // Calculate average completion time (mock data for now)
    const avgCompletionTime = 2.4

    // Calculate productivity score
    const productivityScore = Math.min(
      100,
      Math.round(
        (completedTasks / Math.max(totalTasks, 1)) * 100 * 0.7 +
          (Math.max(0, totalTasks - overdueTasks) / Math.max(totalTasks, 1)) * 100 * 0.3,
      ),
    )

    // Generate weekly progress data
    const weeklyProgress = []
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayTasks = recentTasks.filter((task) => {
        const taskDate = new Date(task.createdAt)
        return taskDate.toDateString() === date.toDateString()
      })

      weeklyProgress.push({
        day: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
        completed: dayTasks.filter((task) => task.status === "done").length,
        created: dayTasks.length,
      })
    }

    // Priority distribution
    const priorityDistribution = {
      high: recentTasks.filter((task) => task.priority === "high").length,
      medium: recentTasks.filter((task) => task.priority === "medium").length,
      low: recentTasks.filter((task) => task.priority === "low").length,
    }

    // Team productivity (mock data)
    const teamProductivity = [
      { name: "You", completed: completedTasks, pending: totalTasks - completedTasks },
      {
        name: "Team Member 1",
        completed: Math.floor(Math.random() * 10) + 5,
        pending: Math.floor(Math.random() * 5) + 2,
      },
      {
        name: "Team Member 2",
        completed: Math.floor(Math.random() * 8) + 3,
        pending: Math.floor(Math.random() * 4) + 1,
      },
    ]

    const analyticsData = {
      totalTasks,
      completedTasks,
      inProgressTasks,
      overdueTasks,
      teamMembers: teamMembers + 1, // Include current user
      avgCompletionTime,
      productivityScore,
      weeklyProgress,
      priorityDistribution,
      teamProductivity,
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
