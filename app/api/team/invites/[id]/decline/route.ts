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

    // Find and update the invitation
    const result = await db.collection("team_invites").updateOne(
      {
        _id: new ObjectId(inviteId),
        toUserId: userId,
        status: "pending",
      },
      {
        $set: {
          status: "declined",
          declinedAt: new Date().toISOString(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Invitation not found or already processed" }, { status: 404 })
    }

    // Get invitation details for notification
    const invitation = await db.collection("team_invites").findOne({
      _id: new ObjectId(inviteId),
    })

    if (invitation) {
      // Create notification for inviter
      await db.collection("notifications").insertOne({
        userId: invitation.fromUserId,
        type: "team_invite_declined",
        title: "Invitation Declined",
        message: `${invitation.toUserName} declined your team invitation`,
        read: false,
        createdAt: new Date().toISOString(),
      })
    }

    return NextResponse.json({ success: true, message: "Invitation declined" })
  } catch (error) {
    console.error("Error declining invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
