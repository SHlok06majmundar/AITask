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

    // Get events for current user and their team members
    const events = await db
      .collection("calendar_events")
      .find({
        $or: [{ createdBy: userId }, { attendees: { $in: [userId] } }],
      })
      .sort({ start: 1 })
      .toArray()

    return NextResponse.json(events)
  } catch (error) {
    console.error("Error fetching calendar events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, start, end, type, priority, attendees } = await request.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const db = await getDatabase()

    const event = {
      title,
      description: description || "",
      start: start ? new Date(start) : new Date(),
      end: end ? new Date(end) : new Date(Date.now() + 60 * 60 * 1000), // Default to 1 hour from now
      type: type || "meeting",
      priority: priority || "medium",
      attendees: attendees || [],
      createdBy: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const result = await db.collection("calendar_events").insertOne(event)
    const createdEvent = await db.collection("calendar_events").findOne({ _id: result.insertedId })

    // Create notifications for attendees
    if (attendees && attendees.length > 0) {
      const notifications = attendees.map((attendeeEmail: string) => ({
        email: attendeeEmail,
        type: "calendar_invite",
        title: "New Calendar Event",
        message: `You've been invited to: ${title}`,
        read: false,
        createdAt: new Date().toISOString(),
        data: {
          eventId: result.insertedId,
          eventTitle: title,
          eventStart: start,
        },
      }))

      await db.collection("notifications").insertMany(notifications)
    }

    return NextResponse.json(createdEvent, { status: 201 })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
