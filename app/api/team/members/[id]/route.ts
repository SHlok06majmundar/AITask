import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const memberId = params.id

    // Find the team member
    const member = await db.collection("team_members").findOne({
      _id: new ObjectId(memberId),
    })

    if (!member) {
      return NextResponse.json({ error: "Team member not found" }, { status: 404 })
    }

    // Check if current user has permission to remove this member
    if (member.teamOwnerId !== userId && member.teamId !== userId) {
      return NextResponse.json({ error: "You don't have permission to remove this member" }, { status: 403 })
    }

    // Remove team member
    await db.collection("team_members").deleteOne({
      _id: new ObjectId(memberId),
    })

    // Create notification for removed member
    await db.collection("notifications").insertOne({
      userId: member.userId,
      type: "team_removed",
      title: "Removed from Team",
      message: `You have been removed from the team`,
      read: false,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, message: "Member removed successfully" })
  } catch (error) {
    console.error("Error removing team member:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
