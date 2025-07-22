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

    // Get current date for calculations
    const now = new Date()
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Fetch tasks data
    const tasks = await db
      .collection("tasks")
      .find({
        $or: [{ assignedTo: userId }, { createdBy: userId }],
      })
      .toArray()

    // Fetch team data
    const teamMembers = await db
      .collection("team_members")
      .find({
        $or: [{ userId: userId }, { teamId: userId }],
      })
      .toArray()

    // Fetch calendar events
    const events = await db
      .collection("calendar_events")
      .find({
        $or: [{ createdBy: userId }, { attendees: { $in: [userId] } }],
      })
      .toArray()

    // Calculate analytics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === "completed").length
    const inProgressTasks = tasks.filter((t) => t.status === "in-progress").length
    const overdueTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed",
    ).length

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    const productivityScore = Math.min(
      100,
      Math.max(0, completionRate * 0.6 + Math.max(0, 100 - (overdueTasks / totalTasks) * 100) * 0.4),
    )

    // Fetch team tasks for time tracking data
    const teamTasks = await db
      .collection("team_tasks")
      .find({
        $or: [{ assignedTo: userId }, { createdBy: userId }],
      })
      .toArray()

    // Calculate real time tracking data
    let totalTrackedMinutes = 0
    let totalTrackedSessions = 0
    let productiveHours = Array(24).fill(0)
    
    teamTasks.forEach((task: any) => {
      if (task.timeTracking && task.timeTracking.sessions) {
        task.timeTracking.sessions.forEach((session: any) => {
          totalTrackedMinutes += session.duration || 0
          totalTrackedSessions++
          
          // Track productive hours based on session timestamps
          if (session.date) {
            const sessionHour = new Date(session.date).getHours()
            productiveHours[sessionHour]++
          }
        })
      }
    })

    const totalTrackedHours = Math.round((totalTrackedMinutes / 60) * 10) / 10
    const averageDailyHours = totalTrackedSessions > 0 ? Math.round((totalTrackedHours / 7) * 10) / 10 : 0 // Assume week average
    const mostProductiveHour = productiveHours.indexOf(Math.max(...productiveHours)) || 10 // Default to 10 AM if no data
    
    // Calculate efficiency based on estimated vs actual time
    let totalEstimated = 0
    let totalActual = 0
    teamTasks.forEach((task: any) => {
      if (task.timeTracking) {
        totalEstimated += task.timeTracking.estimated || 0
        totalActual += task.timeTracking.actual || 0
      }
    })
    
    const timeEfficiency = totalEstimated > 0 ? Math.round((totalEstimated / Math.max(totalActual, 1)) * 100) : 85

    // Generate trend data (simulated for demo)
    const dailyTrends = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return {
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completed: Math.floor(Math.random() * 10) + 1,
        created: Math.floor(Math.random() * 8) + 2,
        productivity: Math.floor(Math.random() * 30) + 70,
      }
    })

    const weeklyTrends = Array.from({ length: 4 }, (_, i) => ({
      week: `Week ${i + 1}`,
      tasks: Math.floor(Math.random() * 20) + 10,
      hours: Math.floor(Math.random() * 30) + 20,
      efficiency: Math.floor(Math.random() * 20) + 75,
    }))

    const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - i))
      return {
        month: date.toLocaleDateString("en-US", { month: "short" }),
        productivity: Math.floor(Math.random() * 20) + 70,
        teamGrowth: Math.floor(Math.random() * 5) + 1,
        satisfaction: Math.floor(Math.random() * 15) + 80,
      }
    })

    // Priority distribution
    const priorities = [
      { name: "High", value: tasks.filter((t) => t.priority === "high").length, color: "#ef4444" },
      { name: "Medium", value: tasks.filter((t) => t.priority === "medium").length, color: "#f59e0b" },
      { name: "Low", value: tasks.filter((t) => t.priority === "low").length, color: "#10b981" },
    ]

    // Categories (simulated)
    const categories = [
      { name: "Development", completed: 12, total: 15, percentage: 80 },
      { name: "Design", completed: 8, total: 12, percentage: 67 },
      { name: "Marketing", completed: 5, total: 8, percentage: 63 },
      { name: "Research", completed: 3, total: 5, percentage: 60 },
    ]

    const analyticsData = {
      productivity: {
        score: Math.round(productivityScore),
        trend: Math.floor(Math.random() * 20) - 10, // -10 to +10
        tasksCompleted: completedTasks,
        averageCompletionTime: Math.round((Math.random() * 4 + 2) * 10) / 10, // 2-6 hours
      },
      team: {
        totalMembers: teamMembers.length || 1,
        activeMembers: Math.max(1, Math.floor(teamMembers.length * 0.8)),
        collaboration: Math.floor(Math.random() * 20) + 70,
        efficiency: Math.floor(Math.random() * 15) + 80,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        overdue: overdueTasks,
        completionRate,
      },
      timeTracking: {
        totalHours: totalTrackedHours,
        averageDaily: averageDailyHours,
        mostProductiveHour: mostProductiveHour,
        efficiency: timeEfficiency,
      },
      trends: {
        daily: dailyTrends,
        weekly: weeklyTrends,
        monthly: monthlyTrends,
      },
      priorities,
      categories,
    }

    return NextResponse.json(analyticsData)
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
