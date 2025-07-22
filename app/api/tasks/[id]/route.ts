import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, priority, status, assignee } = body

    const db = await getDatabase()
    const result = await db.collection("tasks").updateOne(
      { _id: new ObjectId(id), userId },
      {
        $set: {
          title,
          description,
          priority,
          status,
          assignee,
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
      action: "updated",
      taskId: new ObjectId(id),
      taskTitle: title,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const db = await getDatabase()
    const task = await db.collection("tasks").findOne({ _id: new ObjectId(id), userId })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    await db.collection("tasks").deleteOne({ _id: new ObjectId(id), userId })

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "deleted",
      taskId: new ObjectId(id),
      taskTitle: task.title,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
