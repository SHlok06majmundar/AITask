import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET(request: Request, { params }: { params: { token: string } }) {
  try {
    const db = await getDatabase()

    const invite = await db.collection("team_invites").findOne({
      inviteToken: params.token,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })

    if (!invite) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 })
    }

    // Get inviter info
    const inviter = await clerkClient.users.getUser(invite.invitedBy)

    return NextResponse.json({
      email: invite.email,
      role: invite.role,
      invitedBy: `${inviter.firstName} ${inviter.lastName}`,
      status: invite.status,
    })
  } catch (error) {
    console.error("Error fetching invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: { token: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    const invite = await db.collection("team_invites").findOne({
      inviteToken: params.token,
      status: "pending",
      expiresAt: { $gt: new Date() },
    })

    if (!invite) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 })
    }

    // Get user info from Clerk
    const user = await clerkClient.users.getUser(userId)

    // Check if user email matches invite email
    const userEmail = user.emailAddresses.find((email) => email.id === user.primaryEmailAddressId)?.emailAddress

    if (userEmail !== invite.email) {
      return NextResponse.json(
        {
          error: "This invitation was sent to a different email address",
        },
        { status: 400 },
      )
    }

    // Add user to team
    const teamMember = {
      userId,
      email: userEmail,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      role: invite.role,
      status: "active",
      joinedAt: new Date(),
    }

    await db.collection("team_members").insertOne(teamMember)

    // Update invitation status
    await db.collection("team_invites").updateOne(
      { _id: invite._id },
      {
        $set: {
          status: "accepted",
          acceptedAt: new Date(),
          acceptedBy: userId,
        },
      },
    )

    return NextResponse.json({ message: "Successfully joined team" })
  } catch (error) {
    console.error("Error accepting invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
