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
    const { comment } = body

    if (!comment || !comment.trim()) {
      return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 })
    }

    const userProfile = await db.collection("profiles").findOne({ userId })

    const newComment = {
      _id: new ObjectId().toString(),
      userId,
      userName: userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : "Unknown User",
      userImage: userProfile?.imageUrl || "/placeholder.svg",
      comment: comment.trim(),
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection("team_tasks").updateOne(
      { _id: new ObjectId(id) },
      {
        $push: { comments: newComment },
        $set: { updatedAt: new Date() },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Create notification for task assignee (if not the commenter)
    if (task.assignedTo !== userId) {
      await db.collection("notifications").insertOne({
        userId: task.assignedTo,
        type: "task_comment",
        title: "New Comment",
        message: `${newComment.userName} commented on: ${task.title}`,
        taskId: id,
        fromUserId: userId,
        read: false,
        createdAt: new Date(),
      })
    }

    // Create notification for task creator (if not the commenter and not the assignee)
    if (task.createdBy !== userId && task.createdBy !== task.assignedTo) {
      await db.collection("notifications").insertOne({
        userId: task.createdBy,
        type: "task_comment",
        title: "New Comment",
        message: `${newComment.userName} commented on: ${task.title}`,
        taskId: id,
        fromUserId: userId,
        read: false,
        createdAt: new Date(),
      })
    }

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "comment_added",
      taskId: id,
      taskTitle: task.title,
      details: { comment: comment.trim() },
      timestamp: new Date(),
    })

    return NextResponse.json(newComment)
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
