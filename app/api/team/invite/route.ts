import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, role = "member" } = await request.json()

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user is already a member
    const existingMember = await db.collection("team_members").findOne({ email })
    if (existingMember) {
      return NextResponse.json({ error: "User is already a team member" }, { status: 400 })
    }

    // Check if invitation already exists
    const existingInvite = await db.collection("team_invites").findOne({
      email,
      status: "pending",
    })
    if (existingInvite) {
      return NextResponse.json({ error: "Invitation already sent to this email" }, { status: 400 })
    }

    // Create invitation
    const inviteToken = uuidv4()
    const invitation = {
      email,
      role,
      invitedBy: userId,
      invitedByName: `${user.firstName} ${user.lastName}`,
      invitedAt: new Date().toISOString(),
      status: "pending",
      inviteToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }

    await db.collection("team_invites").insertOne(invitation)

    // Create notification for inviter
    await db.collection("notifications").insertOne({
      userId,
      type: "team",
      title: "Invitation Sent",
      message: `Team invitation sent to ${email}`,
      read: false,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      inviteToken,
      message: "Invitation sent successfully",
    })
  } catch (error) {
    console.error("Error sending team invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
