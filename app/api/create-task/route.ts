import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { description } = await request.json()

    // Use AI to parse the description and create structured tasks
    const tasks = await parseDescriptionToTasks(description, userId)

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

async function parseDescriptionToTasks(description: string, userId: string) {
  // Try AI-powered task breakdown first
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    try {
      const prompt = `You are a professional project manager AI. Break down this project/task description into specific, actionable tasks.

Project Description: "${description}"

Please analyze this and create a detailed task breakdown. Return ONLY a JSON array of tasks with this exact format:
[
  {
    "title": "Specific task title (max 60 characters)",
    "description": "Detailed description of what needs to be done",
    "priority": "high|medium|low",
    "status": "todo",
    "estimatedHours": 1-8
  }
]

Guidelines:
- Create 2-8 tasks depending on project complexity
- Make tasks specific and actionable
- Assign realistic priorities (high for critical/time-sensitive, medium for important, low for nice-to-have)
- Each task should be completable in 1-8 hours
- Include setup, execution, and review tasks where appropriate
- For team projects, consider coordination and communication tasks
- For technical projects, include planning, development, testing phases
- Ensure logical sequence and dependencies

Examples:
- "Build inventory system" → Planning, Database design, Frontend development, Testing, Deployment
- "Team meeting" → Agenda preparation, Invitations, Material preparation, Follow-up tasks
- "Marketing campaign" → Research, Strategy, Content creation, Launch, Analysis`

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
      const result = await model.generateContent(prompt)
      let aiResponse = result.response.text()

      // Clean up the response to extract JSON
      aiResponse = aiResponse.replace(/```json\n?/, '').replace(/\n?```/, '').trim()
      
      try {
        const aiTasks = JSON.parse(aiResponse)
        if (Array.isArray(aiTasks) && aiTasks.length > 0) {
          // Validate and sanitize AI-generated tasks
          return aiTasks.map(task => ({
            title: task.title?.substring(0, 60) || "Generated Task",
            description: task.description || "AI-generated task description",
            priority: ["high", "medium", "low"].includes(task.priority) ? task.priority : "medium",
            status: "todo",
            estimatedHours: typeof task.estimatedHours === 'number' ? Math.min(Math.max(task.estimatedHours, 1), 8) : 2
          }))
        }
      } catch (parseError) {
        console.error("Error parsing AI task breakdown:", parseError)
        // Fall through to manual parsing
      }
    } catch (aiError) {
      console.error("Error generating AI task breakdown:", aiError)
      // Fall through to manual parsing
    }
  }

  // Fallback to enhanced manual parsing
  const tasks = []
  const lowerDesc = description.toLowerCase()

  // Enhanced keyword-based parsing
  if (lowerDesc.includes("inventory") || lowerDesc.includes("stock") || lowerDesc.includes("warehouse")) {
    tasks.push(
      {
        title: "Analyze Current Inventory System",
        description: "Review existing inventory processes and identify gaps or inefficiencies",
        priority: "high",
        status: "todo",
        estimatedHours: 3
      },
      {
        title: "Design Database Schema",
        description: "Create database structure for products, categories, suppliers, and stock levels",
        priority: "high", 
        status: "todo",
        estimatedHours: 4
      },
      {
        title: "Develop Frontend Interface",
        description: "Build user interface for inventory management, search, and reporting",
        priority: "medium",
        status: "todo",
        estimatedHours: 6
      },
      {
        title: "Implement Backend Logic",
        description: "Create APIs for CRUD operations, stock tracking, and notifications",
        priority: "medium",
        status: "todo",
        estimatedHours: 5
      },
      {
        title: "Test System Integration",
        description: "Perform comprehensive testing of all inventory features and workflows",
        priority: "high",
        status: "todo",
        estimatedHours: 3
      },
      {
        title: "Deploy and Train Users",
        description: "Deploy system to production and train team members on new processes",
        priority: "medium",
        status: "todo",
        estimatedHours: 2
      }
    )
  } else if (lowerDesc.includes("team") && (lowerDesc.includes("member") || lowerDesc.includes("divide") || lowerDesc.includes("assign"))) {
    tasks.push(
      {
        title: "Define Project Scope and Requirements",
        description: "Clearly outline project goals, deliverables, and technical requirements",
        priority: "high",
        status: "todo",
        estimatedHours: 2
      },
      {
        title: "Create Work Breakdown Structure",
        description: "Break down project into modules and assign to frontend, backend, and full-stack roles",
        priority: "high",
        status: "todo", 
        estimatedHours: 3
      },
      {
        title: "Set Up Development Environment",
        description: "Configure shared repositories, development tools, and deployment pipelines",
        priority: "medium",
        status: "todo",
        estimatedHours: 2
      },
      {
        title: "Establish Communication Protocols",
        description: "Set up regular check-ins, progress tracking, and collaboration workflows",
        priority: "medium",
        status: "todo",
        estimatedHours: 1
      },
      {
        title: "Create Integration Plan",
        description: "Plan how frontend, backend, and full-stack components will integrate",
        priority: "high",
        status: "todo",
        estimatedHours: 2
      }
    )
  } else if (lowerDesc.includes("presentation") || lowerDesc.includes("demo")) {
    tasks.push(
      {
        title: "Research and Gather Content",
        description: "Collect relevant data, statistics, and supporting materials for the presentation",
        priority: "high",
        status: "todo",
        estimatedHours: 3
      },
      {
        title: "Create Presentation Outline",
        description: "Structure the flow and key points of the presentation",
        priority: "high",
        status: "todo",
        estimatedHours: 2
      },
      {
        title: "Design Visual Slides",
        description: "Create engaging slides with charts, graphics, and visual elements",
        priority: "medium",
        status: "todo",
        estimatedHours: 4
      },
      {
        title: "Practice and Rehearse",
        description: "Practice delivery, timing, and prepare for potential questions",
        priority: "medium",
        status: "todo",
        estimatedHours: 2
      }
    )
  } else {
    // Generic intelligent parsing
    const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    if (sentences.length > 1) {
      sentences.forEach((sentence, index) => {
        tasks.push({
          title: sentence.trim().substring(0, 50) + (sentence.length > 50 ? "..." : ""),
          description: sentence.trim(),
          priority: index === 0 ? "high" : "medium",
          status: "todo",
          estimatedHours: 2
        })
      })
    } else {
      // Single comprehensive task
      tasks.push({
        title: description.substring(0, 50) + (description.length > 50 ? "..." : ""),
        description: description,
        priority: "high",
        status: "todo",
        estimatedHours: 3
      })
    }
  }

  return tasks.length > 0 ? tasks : [{
    title: "Complete Task",
    description: description,
    priority: "medium", 
    status: "todo",
    estimatedHours: 2
  }]
}
