import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { comment } = body

    const db = await getDatabase()

    // Get user details
    const user = await db.collection("profiles").findOne({ userId })

    const commentData = {
      _id: new ObjectId(),
      userId,
      userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
      userImage: user?.imageUrl || "/placeholder.svg",
      comment,
      createdAt: new Date(),
    }

    const result = await db.collection("team_tasks").updateOne(
      { _id: new ObjectId(params.id) },
      {
        $push: { comments: commentData },
        $set: { updatedAt: new Date() },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Get task details for notification
    const task = await db.collection("team_tasks").findOne({ _id: new ObjectId(params.id) })

    // Notify assigned user if different from commenter
    if (task && task.assignedTo !== userId) {
      await db.collection("notifications").insertOne({
        userId: task.assignedTo,
        type: "task_comment",
        title: "New Comment on Task",
        message: `${commentData.userName} commented on: ${task.title}`,
        taskId: new ObjectId(params.id),
        fromUserId: userId,
        read: false,
        createdAt: new Date(),
      })
    }

    return NextResponse.json(commentData)
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
