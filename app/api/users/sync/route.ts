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

    // Check if user profile already exists
    const existingProfile = await db.collection("profiles").findOne({ userId })

    if (!existingProfile) {
      // Create new profile
      const profile = {
        userId,
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        imageUrl: user.imageUrl || "/placeholder.svg",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await db.collection("profiles").insertOne(profile)

      // Check if user already has a team member record
      const existingTeamMember = await db.collection("team_members").findOne({ userId })
      
      if (!existingTeamMember) {
        // Create team member record with owner role for new users
        const teamMember = {
          userId,
          email: user.emailAddresses[0]?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl || "/placeholder.svg",
          role: "owner",
          status: "active",
          joinedAt: new Date().toISOString(),
          teamId: userId,
          teamOwnerId: userId,
        }

        await db.collection("team_members").insertOne(teamMember)
      }

      return NextResponse.json({ message: "Profile created", profile })
    }

    // Update existing profile
    await db.collection("profiles").updateOne(
      { userId },
      {
        $set: {
          email: user.emailAddresses[0]?.emailAddress || existingProfile.email,
          firstName: user.firstName || existingProfile.firstName,
          lastName: user.lastName || existingProfile.lastName,
          imageUrl: user.imageUrl || existingProfile.imageUrl,
          updatedAt: new Date().toISOString(),
        },
      },
    )

    // Also check if team member record exists for existing users
    const existingTeamMember = await db.collection("team_members").findOne({ userId })
    
    if (!existingTeamMember) {
      // Create team member record with owner role for existing users who don't have one
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
    }

    return NextResponse.json({ message: "Profile updated" })
  } catch (error) {
    console.error("Error syncing user:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
