import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const tasks = await db.collection("tasks").find({ userId }).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, priority, status, assignee } = body

    const db = await getDatabase()
    const task = {
      title,
      description,
      priority: priority || "medium",
      status: status || "todo",
      assignee,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("tasks").insertOne(task)

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "created",
      taskId: result.insertedId,
      taskTitle: title,
      timestamp: new Date(),
    })

    return NextResponse.json({ ...task, _id: result.insertedId })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
