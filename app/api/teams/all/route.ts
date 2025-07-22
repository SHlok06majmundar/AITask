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

    // Get all teams by aggregating team members
    const teamsAggregation = await db
      .collection("team_members")
      .aggregate([
        {
          $group: {
            _id: "$teamId",
            memberCount: { $sum: 1 },
            teamOwnerId: { $first: "$teamOwnerId" },
            createdAt: { $min: "$joinedAt" },
          },
        },
      ])
      .toArray()

    // Get team owner details for each team
    const teams = await Promise.all(
      teamsAggregation.map(async (team) => {
        const owner = await db.collection("profiles").findOne({ userId: team.teamOwnerId })
        return {
          _id: team._id,
          name: owner ? `${owner.firstName}'s Team` : "Unknown Team",
          description: `A collaborative team with ${team.memberCount} members`,
          ownerId: team.teamOwnerId,
          memberCount: team.memberCount,
          createdAt: team.createdAt,
        }
      }),
    )

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
