import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get team members where current user is the team owner/admin
    const members = await db
      .collection("team_members")
      .find({
        $or: [{ teamOwnerId: userId }, { teamId: userId }, { userId: userId }],
      })
      .toArray()

    // Also include current user as team owner if they have team members
    const currentUserProfile = await db.collection("profiles").findOne({ userId })

    if (currentUserProfile && members.length === 0) {
      // Add current user as team owner and persist to database
      const ownerMember = {
        userId: currentUserProfile.userId,
        email: currentUserProfile.email,
        firstName: currentUserProfile.firstName || "User",
        lastName: currentUserProfile.lastName || "",
        imageUrl: currentUserProfile.imageUrl || "/placeholder.svg",
        role: "owner",
        status: "active",
        joinedAt: currentUserProfile.createdAt || new Date().toISOString(),
        teamId: userId,
        teamOwnerId: userId,
      }

      // Insert into database to persist the owner record
      const result = await db.collection("team_members").insertOne(ownerMember)

      return NextResponse.json([{ ...ownerMember, _id: result.insertedId }])
    }

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
