import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message } = await request.json()

    // Rule-based responses for productivity assistant
    let response = ""

    if (message.toLowerCase().includes("prioritize") || message.toLowerCase().includes("priority")) {
      response = `Here are some task prioritization strategies:

• **Eisenhower Matrix**: Categorize tasks by urgency and importance
• **ABC Method**: Rank tasks as A (must do), B (should do), C (could do)
• **Time-blocking**: Allocate specific time slots for different task types
• **Energy matching**: Do complex tasks when your energy is highest

Would you like me to help you organize your current tasks using one of these methods?`
    } else if (message.toLowerCase().includes("schedule") || message.toLowerCase().includes("time")) {
      response = `Schedule optimization tips:

• **Time audit**: Track how you spend time for a week
• **Batch similar tasks**: Group related activities together
• **Buffer time**: Add 15-20% extra time for unexpected delays
• **Peak hours**: Schedule important work during your most productive hours
• **Break intervals**: Use techniques like Pomodoro (25min work, 5min break)

What specific scheduling challenges are you facing?`
    } else if (message.toLowerCase().includes("team") || message.toLowerCase().includes("collaboration")) {
      response = `Team productivity insights:

• **Clear communication**: Use structured updates and check-ins
• **Defined roles**: Ensure everyone knows their responsibilities
• **Shared goals**: Align team objectives with project outcomes
• **Regular feedback**: Implement weekly retrospectives
• **Tool integration**: Use consistent project management tools

How can I help improve your team's collaboration?`
    } else if (message.toLowerCase().includes("productivity") || message.toLowerCase().includes("tips")) {
      response = `Productivity enhancement strategies:

• **Single-tasking**: Focus on one task at a time for better quality
• **2-minute rule**: If it takes less than 2 minutes, do it now
• **Environment design**: Create a distraction-free workspace
• **Energy management**: Work with your natural energy rhythms
• **Regular reviews**: Weekly planning and daily check-ins

What area of productivity would you like to focus on?`
    } else if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
      response = `Hello! I'm here to help you boost your productivity. I can assist with:

• Task prioritization and organization
• Schedule optimization
• Team collaboration strategies
• Productivity techniques and tips
• Time management best practices

What would you like to work on today?`
    } else {
      response = `I understand you're looking for productivity guidance. Here are some areas I can help with:

• **Task Management**: Prioritization, organization, and tracking
• **Time Management**: Scheduling, time-blocking, and efficiency
• **Team Collaboration**: Communication, delegation, and coordination
• **Productivity Systems**: GTD, Kanban, Agile methodologies
• **Work-Life Balance**: Sustainable productivity practices

Could you tell me more about your specific challenge or goal?`
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error("Error in chat:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
