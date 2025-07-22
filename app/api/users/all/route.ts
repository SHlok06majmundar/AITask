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

    // First, try to get users from our profiles collection
    let users = await db.collection("profiles").find({}).toArray()

    // If no users in profiles, try to get from users collection
    if (users.length === 0) {
      users = await db.collection("users").find({}).toArray()
    }

    // Transform data and add online status
    const transformedUsers = users.map((user) => ({
      _id: user._id,
      userId: user.userId || user.id,
      email: user.email,
      firstName:
        user.firstName || user.first_name || user.fullName?.split(" ")[0] || user.full_name?.split(" ")[0] || "User",
      lastName: user.lastName || user.last_name || user.fullName?.split(" ")[1] || user.full_name?.split(" ")[1] || "",
      imageUrl: user.imageUrl || user.image_url || user.avatar_url || user.profileImageUrl || "/placeholder.svg",
      joinedAt: user.createdAt || user.created_at || user.updatedAt || user.updated_at || new Date().toISOString(),
      isOnline: Math.random() > 0.3, // Simulate online status
      lastSeen: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    }))

    // Filter out current user
    const filteredUsers = transformedUsers.filter((user) => user.userId !== userId)

    return NextResponse.json(filteredUsers)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
