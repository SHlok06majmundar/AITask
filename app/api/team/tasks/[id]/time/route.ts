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
    const { action, duration } = body // action: 'start' | 'stop' | 'log'

    const db = await getDatabase()

    const user = await db.collection("profiles").findOne({ userId })

    if (action === "log" && duration) {
      // Log time manually
      const timeSession = {
        _id: new ObjectId(),
        userId,
        userName: user ? `${user.firstName} ${user.lastName}` : "Unknown",
        duration, // in minutes
        description: body.description || "",
        date: new Date(),
      }

      await db.collection("team_tasks").updateOne(
        { _id: new ObjectId(params.id) },
        {
          $push: { "timeTracking.sessions": timeSession },
          $inc: { "timeTracking.actual": duration },
          $set: { updatedAt: new Date() },
        },
      )

      return NextResponse.json(timeSession)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error logging time:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
