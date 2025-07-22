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
    const settings = await db.collection("user_settings").findOne({ userId })

    return NextResponse.json(settings || {})
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const settings = await request.json()
    const db = await getDatabase()

    await db
      .collection("user_settings")
      .updateOne({ userId }, { $set: { ...settings, userId, updatedAt: new Date() } }, { upsert: true })

    return NextResponse.json({ message: "Settings saved successfully" })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
