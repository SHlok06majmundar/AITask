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

    const { read } = await request.json()

    const db = await getDatabase()
    await db
      .collection("notifications")
      .updateOne({ _id: new ObjectId(params.id), userId }, { $set: { read, updatedAt: new Date() } })

    return NextResponse.json({ message: "Notification updated" })
  } catch (error) {
    console.error("Error updating notification:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
