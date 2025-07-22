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
    const events = await db.collection("calendar_events").find({ userId }).sort({ date: 1, time: 1 }).toArray()

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

    const body = await request.json()
    const { title, description, date, time, type, priority, location } = body

    if (!title || !date || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()
    const event = {
      title,
      description: description || "",
      date,
      time,
      type: type || "meeting",
      priority: priority || "medium",
      location: location || "",
      userId,
      createdAt: new Date().toISOString(),
    }

    const result = await db.collection("calendar_events").insertOne(event)

    // Create notification
    await db.collection("notifications").insertOne({
      userId,
      type: "calendar",
      title: "Event Created",
      message: `New ${type} "${title}" scheduled for ${date} at ${time}`,
      read: false,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ ...event, _id: result.insertedId })
  } catch (error) {
    console.error("Error creating calendar event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
