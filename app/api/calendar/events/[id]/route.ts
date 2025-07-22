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
    const { title, description, date, time, type, priority, location } = body

    if (!title || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const result = await db.collection("calendar_events").updateOne(
      { _id: new ObjectId(params.id), userId },
      {
        $set: {
          title,
          description: description || "",
          date,
          time,
          type: type || "meeting",
          priority: priority || "medium",
          location: location || "",
          updatedAt: new Date().toISOString(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Create notification
    await db.collection("notifications").insertOne({
      userId,
      type: "calendar",
      title: "Event Updated",
      message: `Event "${title}" has been updated`,
      read: false,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating calendar event:", error)
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

    // Get event details before deletion for notification
    const event = await db.collection("calendar_events").findOne({ _id: new ObjectId(params.id), userId })

    const result = await db.collection("calendar_events").deleteOne({ _id: new ObjectId(params.id), userId })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Create notification
    if (event) {
      await db.collection("notifications").insertOne({
        userId,
        type: "calendar",
        title: "Event Deleted",
        message: `Event "${event.title}" has been deleted`,
        read: false,
        createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
