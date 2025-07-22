import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Check if user already has a team member record
    const existingTeamMember = await db.collection("team_members").findOne({ userId })
    
    if (!existingTeamMember) {
      // Create team member record with owner role
      const teamMember = {
        userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl || "/placeholder.svg",
        role: "owner",
        status: "active",
        joinedAt: new Date().toISOString(),
        teamId: userId, // User's own team
        teamOwnerId: userId,
      }

      await db.collection("team_members").insertOne(teamMember)
      return NextResponse.json({ message: "Admin role created successfully", teamMember })
    } else {
      // Update existing record to owner if it's not already
      if (existingTeamMember.role !== "owner" && existingTeamMember.role !== "admin") {
        await db.collection("team_members").updateOne(
          { userId },
          { $set: { role: "owner", updatedAt: new Date().toISOString() } }
        )
        return NextResponse.json({ message: "Role updated to owner successfully" })
      }
      
      return NextResponse.json({ message: "User already has admin/owner role", role: existingTeamMember.role })
    }

  } catch (error) {
    console.error("Error fixing admin role:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
