import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    const notifications = await db
      .collection("notifications")
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray()

    return NextResponse.json(notifications)
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { type, title, message, targetUserId } = await request.json()
    const { db } = await connectToDatabase()

    const notification = {
      userId: targetUserId || userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date(),
    }

    const result = await db.collection("notifications").insertOne(notification)

    return NextResponse.json({
      success: true,
      notificationId: result.insertedId,
    })
  } catch (error) {
    console.error("Error creating notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
