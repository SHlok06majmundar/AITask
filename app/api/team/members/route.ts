import { NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Get team members from database
    const teamMembers = await db
      .collection("team_members")
      .find({ teamId: userId }) // Using userId as teamId for simplicity
      .toArray()

    // Enrich with Clerk user data
    const enrichedMembers = await Promise.all(
      teamMembers.map(async (member) => {
        try {
          const user = await clerkClient.users.getUser(member.userId)
          return {
            ...member,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses[0]?.emailAddress,
            imageUrl: user.imageUrl,
          }
        } catch (error) {
          return member
        }
      }),
    )

    return NextResponse.json(enrichedMembers)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
