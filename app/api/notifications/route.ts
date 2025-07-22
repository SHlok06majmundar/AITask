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
    const notifications = await db
      .collection("notifications")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, message, type = "info" } = await request.json()

    const db = await getDatabase()
    const notification = {
      userId,
      title,
      message,
      type,
      read: false,
      createdAt: new Date(),
    }

    await db.collection("notifications").insertOne(notification)

    return NextResponse.json({ message: "Notification created" })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
