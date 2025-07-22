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

    // Get all teams with member counts
    const teams = await db
      .collection("team_members")
      .aggregate([
        {
          $group: {
            _id: "$teamId",
            memberCount: { $sum: 1 },
            members: { $push: "$$ROOT" },
          },
        },
        {
          $lookup: {
            from: "profiles",
            localField: "_id",
            foreignField: "userId",
            as: "owner",
          },
        },
        {
          $project: {
            _id: 1,
            name: {
              $concat: [{ $arrayElemAt: ["$owner.firstName", 0] }, "'s Team"],
            },
            description: "Collaborative workspace for team productivity",
            ownerId: "$_id",
            memberCount: 1,
            createdAt: { $arrayElemAt: ["$members.joinedAt", 0] },
          },
        },
      ])
      .toArray()

    return NextResponse.json(teams)
  } catch (error) {
    console.error("Error fetching teams:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
