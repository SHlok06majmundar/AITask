import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const db = await getDatabase()
    const invitation = await db.collection("team_invites").findOne({
      inviteToken: params.token,
      status: "pending",
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 })
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expiresAt)) {
      await db.collection("team_invites").updateOne({ _id: invitation._id }, { $set: { status: "expired" } })
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

    return NextResponse.json({
      email: invitation.email,
      role: invitation.role,
      invitedBy: invitation.invitedByName,
      invitedAt: invitation.invitedAt,
    })
  } catch (error) {
    console.error("Error fetching invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const invitation = await db.collection("team_invites").findOne({
      inviteToken: params.token,
      status: "pending",
    })

    if (!invitation) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 })
    }

    // Check if invitation has expired
    if (new Date() > new Date(invitation.expiresAt)) {
      await db.collection("team_invites").updateOne({ _id: invitation._id }, { $set: { status: "expired" } })
      return NextResponse.json({ error: "Invitation has expired" }, { status: 400 })
    }

    // Check if user email matches invitation
    if (user.emailAddresses[0]?.emailAddress !== invitation.email) {
      return NextResponse.json(
        {
          error: "This invitation is for a different email address",
        },
        { status: 400 },
      )
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
    }

    await db.collection("team_members").insertOne(teamMember)

    // Update invitation status
    await db
      .collection("team_invites")
      .updateOne({ _id: invitation._id }, { $set: { status: "accepted", acceptedAt: new Date().toISOString() } })

    // Create notifications
    await Promise.all([
      // Notification for new member
      db
        .collection("notifications")
        .insertOne({
          userId,
          type: "team",
          title: "Welcome to the Team!",
          message: `You've successfully joined the team as ${invitation.role}`,
          read: false,
          createdAt: new Date().toISOString(),
        }),
      // Notification for inviter
      db
        .collection("notifications")
        .insertOne({
          userId: invitation.invitedBy,
          type: "team",
          title: "Invitation Accepted",
          message: `${user.firstName} ${user.lastName} has joined the team`,
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
