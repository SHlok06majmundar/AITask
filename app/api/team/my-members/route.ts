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

    // Get team members where current user is involved
    const teamMembers = await db
      .collection("team_members")
      .find({
        $or: [
          { userId: userId }, // Current user is a member
          { teamId: { $in: await getTeamIds(db, userId) } }, // Members of teams user belongs to
        ],
      })
      .toArray()

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error("Error fetching team members:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

async function getTeamIds(db: any, userId: string) {
  const userTeams = await db.collection("team_members").find({ userId }).toArray()
  return userTeams.map((team: any) => team.teamId)
}
