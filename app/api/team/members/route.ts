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
    const members = await db.collection("team_members").find({}).toArray()

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
