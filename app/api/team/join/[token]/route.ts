import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { db } = await connectToDatabase()
    const token = params.token

    const invite = await db.collection("team_invites").findOne({
      token,
      status: "pending",
    })

    if (!invite) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 })
    }

    // Check if invite is expired (7 days)
    const expiryDate = new Date(invite.createdAt)
    expiryDate.setDate(expiryDate.getDate() + 7)

    if (new Date() > expiryDate) {
      await db.collection("team_invites").updateOne({ _id: invite._id }, { $set: { status: "expired" } })

      return NextResponse.json({ error: "Invitation has expired" }, { status: 410 })
    }

    return NextResponse.json({
      email: invite.email,
      invitedBy: invite.invitedBy,
      invitedByName: invite.invitedByName,
      createdAt: invite.createdAt,
      status: invite.status,
    })
  } catch (error) {
    console.error("Error fetching invite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { token: string } }) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { action } = await request.json()
    const { db } = await connectToDatabase()
    const token = params.token

    const invite = await db.collection("team_invites").findOne({
      token,
      status: "pending",
    })

    if (!invite) {
      return NextResponse.json({ error: "Invalid or expired invitation" }, { status: 404 })
    }

    if (action === "accept") {
      // Get user info from Clerk
      const userResponse = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`,
        },
      })

      const userData = await userResponse.json()
      const userEmail = userData.email_addresses?.[0]?.email_address

      // Verify email matches
      if (userEmail !== invite.email) {
        return NextResponse.json({ error: "Email address does not match invitation" }, { status: 400 })
      }

      // Check if user is already a team member
      const existingMember = await db.collection("team_members").findOne({
        userId,
      })

      if (existingMember) {
        return NextResponse.json({ error: "You are already a team member" }, { status: 400 })
      }

      // Add user to team
      await db.collection("team_members").insertOne({
        userId,
        email: userEmail,
        name:
          userData.first_name && userData.last_name
            ? `${userData.first_name} ${userData.last_name}`
            : userData.username || userEmail,
        role: "member",
        joinedAt: new Date(),
        avatar: userData.image_url,
      })

      // Mark invite as accepted
      await db.collection("team_invites").updateOne({ _id: invite._id }, { $set: { status: "accepted" } })

      // Create notification for the inviter
      await db.collection("notifications").insertOne({
        userId: invite.invitedBy,
        type: "team_join",
        title: "Team Member Joined",
        message: `${userData.first_name || userEmail} has joined your team`,
        read: false,
        createdAt: new Date(),
      })

      return NextResponse.json({ success: true })
    } else if (action === "decline") {
      // Mark invite as declined
      await db.collection("team_invites").updateOne({ _id: invite._id }, { $set: { status: "declined" } })

      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing invite:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
