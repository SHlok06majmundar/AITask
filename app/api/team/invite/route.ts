import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { email, role } = await request.json()

    const db = await getDatabase()

    // Check if invitation already exists
    const existingInvite = await db.collection("team_invites").findOne({ email, teamId: userId })

    if (existingInvite) {
      return NextResponse.json({ error: "Invitation already sent" }, { status: 400 })
    }

    // Create invitation
    const invitation = {
      email,
      role,
      teamId: userId,
      invitedBy: userId,
      status: "pending",
      invitedAt: new Date(),
    }

    await db.collection("team_invites").insertOne(invitation)

    // In a real app, you would send an email here
    console.log(`Invitation sent to ${email}`)

    return NextResponse.json({ message: "Invitation sent successfully" })
  } catch (error) {
    console.error("Error sending invitation:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
