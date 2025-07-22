import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const inviteId = params.id

    // Find the invitation
    const invite = await db.collection("team_invites").findOne({
      _id: new ObjectId(inviteId),
      toUserId: userId,
      status: "pending",
    })

    if (!invite) {
      return NextResponse.json({ error: "Invitation not found or already processed" }, { status: 404 })
    }

    // Update invitation status
    await db.collection("team_invites").updateOne(
      { _id: new ObjectId(inviteId) },
      {
        $set: {
          status: "declined",
          declinedAt: new Date().toISOString(),
        },
      },
    )

    // Create notification for inviter
    await db.collection("notifications").insertOne({
      userId: invite.fromUserId,
      type: "team_invite_declined",
      title: "Invitation Declined",
      message: `${user.firstName} ${user.lastName} declined your team invitation`,
      read: false,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, message: "Invitation declined" })
  } catch (error) {
    console.error("Error declining invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
