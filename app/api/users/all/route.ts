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

    // Get all registered users from profiles collection
    const users = await db.collection("profiles").find({}).toArray()

    // Transform data and add online status
    const transformedUsers = users.map((user) => ({
      _id: user._id,
      userId: user.userId,
      email: user.email,
      firstName: user.firstName || user.fullName?.split(" ")[0] || "",
      lastName: user.lastName || user.fullName?.split(" ")[1] || "",
      imageUrl: user.imageUrl || user.avatar_url || "",
      joinedAt: user.createdAt || user.updatedAt || new Date().toISOString(),
      isOnline: Math.random() > 0.3, // Simulate online status
      lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    return NextResponse.json(transformedUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
