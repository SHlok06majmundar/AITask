import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { description } = await request.json()

    // Parse the description and create structured tasks
    const tasks = parseDescriptionToTasks(description)

    const db = await getDatabase()
    const createdTasks = []

    for (const task of tasks) {
      const taskData = {
        ...task,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await db.collection("tasks").insertOne(taskData)
      createdTasks.push({ ...taskData, _id: result.insertedId })

      // Log activity
      await db.collection("activities").insertOne({
        userId,
        action: "created",
        taskId: result.insertedId,
        taskTitle: task.title,
        timestamp: new Date(),
      })
    }

    return NextResponse.json({
      message: "Tasks created successfully",
      tasksCreated: createdTasks.length,
      tasks: createdTasks,
    })
  } catch (error) {
    console.error("Error creating tasks:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

function parseDescriptionToTasks(description: string) {
  const tasks = []

  // Simple parsing logic - in a real app, this would be more sophisticated
  if (description.toLowerCase().includes("presentation")) {
    tasks.push({
      title: "Create presentation outline",
      description: "Structure the main points and flow of the presentation",
      priority: "high",
      status: "todo",
    })

    if (description.toLowerCase().includes("market analysis")) {
      tasks.push({
        title: "Conduct market analysis",
        description: "Research and analyze current market trends and data",
        priority: "high",
        status: "todo",
      })
    }

    if (description.toLowerCase().includes("performance") || description.toLowerCase().includes("metrics")) {
      tasks.push({
        title: "Compile performance metrics",
        description: "Gather and organize team performance data",
        priority: "medium",
        status: "todo",
      })
    }

    if (description.toLowerCase().includes("budget")) {
      tasks.push({
        title: "Prepare budget overview",
        description: "Create budget summary and financial projections",
        priority: "medium",
        status: "todo",
      })
    }

    tasks.push({
      title: "Design presentation slides",
      description: "Create visual slides with charts and graphics",
      priority: "medium",
      status: "todo",
    })

    tasks.push({
      title: "Practice presentation",
      description: "Rehearse the presentation and time the delivery",
      priority: "low",
      status: "todo",
    })
  } else if (description.toLowerCase().includes("meeting")) {
    tasks.push({
      title: "Prepare meeting agenda",
      description: "Create structured agenda with key discussion points",
      priority: "high",
      status: "todo",
    })

    tasks.push({
      title: "Send meeting invitations",
      description: "Invite participants and share meeting details",
      priority: "medium",
      status: "todo",
    })

    tasks.push({
      title: "Prepare meeting materials",
      description: "Gather documents and resources needed for the meeting",
      priority: "medium",
      status: "todo",
    })
  } else if (description.toLowerCase().includes("project")) {
    tasks.push({
      title: "Define project scope",
      description: "Clearly outline project objectives and deliverables",
      priority: "high",
      status: "todo",
    })

    tasks.push({
      title: "Create project timeline",
      description: "Develop detailed timeline with milestones and deadlines",
      priority: "high",
      status: "todo",
    })

    tasks.push({
      title: "Assign team roles",
      description: "Delegate responsibilities to team members",
      priority: "medium",
      status: "todo",
    })
  } else {
    // Generic task creation
    const sentences = description.split(/[.!?]+/).filter((s) => s.trim().length > 0)

    sentences.forEach((sentence, index) => {
      if (sentence.trim().length > 10) {
        tasks.push({
          title: sentence.trim().substring(0, 50) + (sentence.length > 50 ? "..." : ""),
          description: sentence.trim(),
          priority: index === 0 ? "high" : "medium",
          status: "todo",
        })
      }
    })

    // If no sentences found, create a single task
    if (tasks.length === 0) {
      tasks.push({
        title: description.substring(0, 50) + (description.length > 50 ? "..." : ""),
        description: description,
        priority: "medium",
        status: "todo",
      })
    }
  }

  return tasks
}
