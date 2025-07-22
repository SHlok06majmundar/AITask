import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, status, priority, progress, assignedTo } = body

    const db = await getDatabase()

    const result = await db.collection("team_tasks").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          title,
          description,
          status,
          priority,
          progress: progress || 0,
          assignedTo,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "task_updated",
      taskId: new ObjectId(params.id),
      taskTitle: title,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating team task:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    const task = await db.collection("team_tasks").findOne({ _id: new ObjectId(params.id) })
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await db.collection("team_tasks").deleteOne({ _id: new ObjectId(params.id) })

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "task_deleted",
      taskId: new ObjectId(params.id),
      taskTitle: task.title,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting team task:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
