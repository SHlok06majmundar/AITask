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

    // Get tasks where user is assigned or is the creator
    const tasks = await db
      .collection("team_tasks")
      .find({
        $or: [{ assignedTo: userId }, { createdBy: userId }, { teamMembers: userId }],
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Populate user details
    const tasksWithDetails = await Promise.all(
      tasks.map(async (task) => {
        const assignedUser = await db.collection("profiles").findOne({ userId: task.assignedTo })
        const createdByUser = await db.collection("profiles").findOne({ userId: task.createdBy })

        return {
          ...task,
          assignedToName: assignedUser ? `${assignedUser.firstName} ${assignedUser.lastName}` : "Unknown",
          assignedToImage: assignedUser?.imageUrl || "/placeholder.svg",
          createdByName: createdByUser ? `${createdByUser.firstName} ${createdByUser.lastName}` : "Unknown",
          createdByImage: createdByUser?.imageUrl || "/placeholder.svg",
        }
      }),
    )

    return NextResponse.json(tasksWithDetails)
  } catch (error) {
    console.error("Error fetching team tasks:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, assignedTo, priority, dueDate, teamId, tags } = body

    const db = await getDatabase()

    const task = {
      title,
      description,
      assignedTo,
      createdBy: userId,
      teamId,
      priority: priority || "medium",
      status: "todo",
      tags: tags || [],
      progress: 0,
      comments: [],
      attachments: [],
      timeTracking: {
        estimated: 0,
        actual: 0,
        sessions: [],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("team_tasks").insertOne(task)

    // Create notification for assigned user
    if (assignedTo !== userId) {
      await db.collection("notifications").insertOne({
        userId: assignedTo,
        type: "task_assigned",
        title: "New Task Assigned",
        message: `You have been assigned a new task: ${title}`,
        taskId: result.insertedId,
        fromUserId: userId,
        read: false,
        createdAt: new Date(),
      })
    }

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "task_created",
      taskId: result.insertedId,
      taskTitle: title,
      assignedTo,
      timestamp: new Date(),
    })

    return NextResponse.json({ ...task, _id: result.insertedId })
  } catch (error) {
    console.error("Error creating team task:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
