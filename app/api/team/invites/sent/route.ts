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

    // Get invitations sent by current user
    const sentInvites = await db
      .collection("team_invites")
      .find({ fromUserId: userId })
      .sort({ invitedAt: -1 })
      .toArray()

    return NextResponse.json(sentInvites)
  } catch (error) {
    console.error("Error fetching sent invites:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
