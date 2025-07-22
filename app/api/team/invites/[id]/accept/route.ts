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

    // Check if user is already a team member
    const existingMember = await db.collection("team_members").findOne({
      userId: userId,
      teamId: invite.fromUserId,
    })

    if (existingMember) {
      return NextResponse.json({ error: "You are already a member of this team" }, { status: 400 })
    }

    // Check if invitation has expired
    if (new Date() > new Date(invite.expiresAt)) {
      await db.collection("team_invites").updateOne({ _id: new ObjectId(inviteId) }, { $set: { status: "expired" } })
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

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

    // Add user to team members
    const teamMember = {
      userId: userId,
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      imageUrl: user.imageUrl || "",
      role: invite.role,
      status: "active",
      joinedAt: new Date().toISOString(),
      teamId: invite.fromUserId,
      teamOwnerId: invite.fromUserId,
      inviteId: inviteId,
    }

    await db.collection("team_members").insertOne(teamMember)

    // Create notifications
    await db.collection("notifications").insertOne({
      userId: invite.fromUserId,
      type: "team_invite_accepted",
      title: "Invitation Accepted",
      message: `${user.firstName} ${user.lastName} accepted your team invitation`,
      read: false,
      createdAt: new Date().toISOString(),
    })

    await db.collection("notifications").insertOne({
      userId: userId,
      type: "team_joined",
      title: "Welcome to the Team",
      message: `You've successfully joined ${invite.fromUserName}'s team as ${invite.role}`,
      read: false,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({ success: true, message: "Invitation accepted successfully" })
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
