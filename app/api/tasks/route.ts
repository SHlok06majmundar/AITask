import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getCollection } from "@/lib/mongodb"

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tasksCollection = await getCollection("tasks")
    const profilesCollection = await getCollection("profiles")
    const projectsCollection = await getCollection("projects")

    // Get tasks with populated assignee and project data
    const tasks = await tasksCollection
      .aggregate([
        {
          $lookup: {
            from: "profiles",
            localField: "assigneeId",
            foreignField: "userId",
            as: "assignee",
          },
        },
        {
          $lookup: {
            from: "projects",
            localField: "projectId",
            foreignField: "_id",
            as: "project",
          },
        },
        {
          $addFields: {
            assignee: { $arrayElemAt: ["$assignee", 0] },
            project: { $arrayElemAt: ["$project", 0] },
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray()

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
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
    const tasksCollection = await getCollection("tasks")

    const newTask = {
      ...body,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await tasksCollection.insertOne(newTask)
    const createdTask = await tasksCollection.findOne({ _id: result.insertedId })

    return NextResponse.json(createdTask, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
