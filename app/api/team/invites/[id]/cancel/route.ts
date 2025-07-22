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

    const db = await getDatabase()
    const inviteId = params.id

    // Find the invitation
    const invite = await db.collection("team_invites").findOne({
      _id: new ObjectId(inviteId),
      fromUserId: userId,
      status: "pending",
    })

    if (!invite) {
      return NextResponse.json({ error: "Invitation not found or cannot be cancelled" }, { status: 404 })
    }

    // Update invitation status
    await db.collection("team_invites").updateOne(
      { _id: new ObjectId(inviteId) },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date().toISOString(),
        },
      },
    )

    // Create notification for invited user
    await db.collection("notifications").insertOne({
      userId: invite.toUserId,
      type: "team_invite_cancelled",
      title: "Invitation Cancelled",
      message: `${invite.fromUserName} cancelled their team invitation`,
      read: false,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, message: "Invitation cancelled" })
  } catch (error) {
    console.error("Error cancelling invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
