import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCollection } from "@/lib/mongodb"

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const activitiesCollection = await getCollection("activities")

    // Get activities with populated user data
    const activities = await activitiesCollection
      .aggregate([
        {
          $lookup: {
            from: "profiles",
            localField: "userId",
            foreignField: "userId",
            as: "user",
          },
        },
        {
          $addFields: {
            user: { $arrayElemAt: ["$user", 0] },
          },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 20 },
      ])
      .toArray()

    return NextResponse.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const activitiesCollection = await getCollection("activities")

    const newActivity = {
      ...body,
      userId,
      createdAt: new Date(),
    }

    const result = await activitiesCollection.insertOne(newActivity)
    const createdActivity = await activitiesCollection.findOne({ _id: result.insertedId })

    return NextResponse.json(createdActivity, { status: 201 })
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
