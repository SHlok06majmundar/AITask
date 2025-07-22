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

    // Get all users from profiles collection
    const profiles = await db.collection("profiles").find({}).toArray()

    // Format the response
    const users = profiles.map((profile) => ({
      _id: profile._id,
      userId: profile.userId,
      email: profile.email,
      firstName: profile.firstName || profile.first_name || "User",
      lastName: profile.lastName || profile.last_name || "",
      imageUrl: profile.imageUrl || profile.image_url || "/placeholder.svg",
      createdAt: profile.createdAt || new Date().toISOString(),
      isOnline: Math.random() > 0.5, // Simulate online status
    }))

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
