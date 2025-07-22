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
    const invitation = await db.collection("team_invites").findOne({
      _id: new ObjectId(inviteId),
      toUserId: userId,
      status: "pending",
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invitation not found or already processed" }, { status: 404 })
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expiresAt)) {
      await db.collection("team_invites").updateOne({ _id: new ObjectId(inviteId) }, { $set: { status: "expired" } })
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

    // Add user to team
    const teamMember = {
      userId,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      role: invitation.role,
      status: "active",
      joinedAt: new Date().toISOString(),
      teamId: invitation.fromUserId, // Using inviter's userId as teamId
    }

    await db.collection("team_members").insertOne(teamMember)

    // Update invitation status
    await db.collection("team_invites").updateOne(
      { _id: new ObjectId(inviteId) },
      {
        $set: {
          status: "accepted",
          acceptedAt: new Date().toISOString(),
        },
      },
    )

    // Create notifications
    await Promise.all([
      // Notification for new member
      db
        .collection("notifications")
        .insertOne({
          userId,
          type: "team_joined",
          title: "Welcome to the Team!",
          message: `You've successfully joined ${invitation.fromUserName}'s team as ${invitation.role}`,
          read: false,
          createdAt: new Date().toISOString(),
        }),
      // Notification for inviter
      db
        .collection("notifications")
        .insertOne({
          userId: invitation.fromUserId,
          type: "team_invite_accepted",
          title: "Invitation Accepted",
          message: `${user.firstName} ${user.lastName} has joined your team`,
          read: false,
          createdAt: new Date().toISOString(),
        }),
    ])

    return NextResponse.json({ success: true, message: "Successfully joined the team!" })
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
