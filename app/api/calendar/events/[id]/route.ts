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

    const { title, description, start, end, type, priority, attendees } = await request.json()

    if (!title || !start || !end) {
      return NextResponse.json({ error: "Title, start, and end are required" }, { status: 400 })
    }

    const db = await getDatabase()
    const eventId = params.id

    // Check if event exists and user has permission
    const existingEvent = await db.collection("calendar_events").findOne({
      _id: new ObjectId(eventId),
      createdBy: userId,
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 })
    }

    const updatedEvent = {
      title,
      description: description || "",
      start: new Date(start),
      end: new Date(end),
      type: type || "meeting",
      priority: priority || "medium",
      attendees: attendees || [],
      updatedAt: new Date().toISOString(),
    }

    await db.collection("calendar_events").updateOne({ _id: new ObjectId(eventId) }, { $set: updatedEvent })

    const event = await db.collection("calendar_events").findOne({ _id: new ObjectId(eventId) })

    return NextResponse.json(event)
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
    const eventId = params.id

    // Check if event exists and user has permission
    const existingEvent = await db.collection("calendar_events").findOne({
      _id: new ObjectId(eventId),
      createdBy: userId,
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found or unauthorized" }, { status: 404 })
    }

    await db.collection("calendar_events").deleteOne({ _id: new ObjectId(eventId) })

    return NextResponse.json({ success: true, message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting calendar event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
