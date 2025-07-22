import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDatabase()
    const task = await db.collection("team_tasks").findOne({ _id: new ObjectId(id) })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Check if user has access to this task
    if (task.assignedTo !== userId && task.createdBy !== userId && !task.teamMembers?.includes(userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    const { action, duration, description } = body

    if (action !== "log" || !duration || duration <= 0) {
      return NextResponse.json({ error: "Invalid time log data" }, { status: 400 })
    }

    const userProfile = await db.collection("profiles").findOne({ userId })

    const timeSession = {
      _id: new ObjectId().toString(),
      userId,
      userName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Unknown User",
      duration: Number(duration),
      description: description || "",
      date: new Date().toISOString(),
    }

    // Update task with new time session
    const currentTimeTracking = task.timeTracking || { estimated: 0, actual: 0, sessions: [] }
    const newActualTime = currentTimeTracking.actual + Number(duration)

    const result = await db.collection("team_tasks").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "timeTracking.actual": newActualTime,
          updatedAt: new Date(),
        },
        $push: { "timeTracking.sessions": timeSession },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "time_logged",
      taskId: id,
      taskTitle: task.title,
      details: { duration: Number(duration), description },
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true, timeSession })
  } catch (error) {
    console.error("Error logging time:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
