import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
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

    // Check if user has access to this task
    if (task.assignedTo !== userId && task.createdBy !== userId && !task.teamMembers?.includes(userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
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

    // Check if user has access to edit this task (assigned user or team member can edit)
    if (task.assignedTo !== userId && task.createdBy !== userId && !task.teamMembers?.includes(userId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    let updateData = {
      ...body,
      updatedAt: new Date(),
    }

    // Remove fields that shouldn't be updated by non-admins
    const userProfile = await db.collection("profiles").findOne({ userId })
    const teamMember = await db.collection("team_members").findOne({ userId })

    const isAdmin = teamMember && (teamMember.role === "admin" || teamMember.role === "owner")

    if (!isAdmin) {
      // Non-admins can only update certain fields
      const allowedFields = ["status", "progress", "description"]
      const filteredUpdate = {}

      allowedFields.forEach((field) => {
        if (body[field] !== undefined) {
          filteredUpdate[field] = body[field]
        }
      })

      updateData = {
        ...filteredUpdate,
        updatedAt: new Date(),
      }
    }

    const result = await db.collection("team_tasks").updateOne({ _id: new ObjectId(params.id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "task_updated",
      taskId: params.id,
      taskTitle: task.title,
      details: updateData,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating task:", error)
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

    // Check if user is admin or owner
    const teamMember = await db.collection("team_members").findOne({ userId })

    if (!teamMember || (teamMember.role !== "admin" && teamMember.role !== "owner")) {
      return NextResponse.json(
        {
          error: "Access denied. Only admins and owners can delete tasks.",
        },
        { status: 403 },
      )
    }

    const task = await db.collection("team_tasks").findOne({ _id: new ObjectId(params.id) })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    const result = await db.collection("team_tasks").deleteOne({ _id: new ObjectId(params.id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    // Log activity
    await db.collection("activities").insertOne({
      userId,
      action: "task_deleted",
      taskId: params.id,
      taskTitle: task.title,
      timestamp: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
