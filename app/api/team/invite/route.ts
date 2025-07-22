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

    const { toUserId, toUserEmail, toUserName, role = "member", message } = await request.json()

    if (!toUserId || !toUserEmail || !toUserName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user is trying to invite themselves
    if (toUserId === userId) {
      return NextResponse.json({ error: "You cannot invite yourself" }, { status: 400 })
    }

    // Check if user is already a team member
    const existingMember = await db.collection("team_members").findOne({
      userId: toUserId,
      teamId: userId, // Using inviter's userId as teamId for simplicity
    })

    if (existingMember) {
      return NextResponse.json({ error: "User is already a team member" }, { status: 400 })
    }

    // Check if invitation already exists
    const existingInvite = await db.collection("team_invites").findOne({
      fromUserId: userId,
      toUserId: toUserId,
      status: "pending",
    })

    if (existingInvite) {
      return NextResponse.json({ error: "Invitation already sent to this user" }, { status: 400 })
    }

    // Create invitation
    const inviteToken = uuidv4()
    const invitation = {
      fromUserId: userId,
      fromUserName: `${user.firstName} ${user.lastName}`,
      fromUserImage: user.imageUrl,
      toUserId,
      toUserEmail,
      toUserName,
      teamName: `${user.firstName}'s Team`,
      role,
      status: "pending",
      message: message || `Join my team as ${role}!`,
      invitedAt: new Date().toISOString(),
      inviteToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }

    await db.collection("team_invites").insertOne(invitation)

    // Create notification for the invited user
    await db.collection("notifications").insertOne({
      userId: toUserId,
      type: "team_invite",
      title: "Team Invitation Received",
      message: `${user.firstName} ${user.lastName} invited you to join their team as ${role}`,
      read: false,
      createdAt: new Date().toISOString(),
      data: {
        inviteId: invitation.inviteToken,
        fromUser: `${user.firstName} ${user.lastName}`,
        role,
      },
    })

    // Create notification for the inviter
    await db.collection("notifications").insertOne({
      userId,
      type: "team_invite_sent",
      title: "Invitation Sent",
      message: `Team invitation sent to ${toUserName}`,
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
