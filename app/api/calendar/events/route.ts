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
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const eventData = await request.json()
    const db = await getDatabase()

    const event = {
      ...eventData,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("calendar_events").insertOne(event)

    return NextResponse.json({ ...event, _id: result.insertedId })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
