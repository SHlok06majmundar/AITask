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
      // Add current user as team owner
      const ownerMember = {
        _id: currentUserProfile._id,
        userId: currentUserProfile.userId,
        email: currentUserProfile.email,
        firstName: currentUserProfile.firstName || "User",
        lastName: currentUserProfile.lastName || "",
        imageUrl: currentUserProfile.imageUrl || "/placeholder.svg",
        role: "owner",
        status: "active",
        joinedAt: currentUserProfile.createdAt || new Date().toISOString(),
        teamId: userId,
      }

      return NextResponse.json([ownerMember])
    }

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
