import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, role } = await request.json()

    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 })
    }

    const db = await getDatabase()

    // Check if user is already a team member
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

    // Generate unique invite token
    const inviteToken = uuidv4()

    // Create invitation
    const invitation = {
      email,
      role,
      invitedBy: userId,
      status: "pending",
      inviteToken,
      invitedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    }

    await db.collection("team_invites").insertOne(invitation)

    // In a real app, you would send an email here with the invite link
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/team/join/${inviteToken}`

    console.log(`Invitation sent to ${email}`)
    console.log(`Invite link: ${inviteLink}`)

    return NextResponse.json({
      message: "Invitation sent successfully",
      inviteToken,
      inviteLink,
    })
  } catch (error) {
    console.error("Error sending invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
