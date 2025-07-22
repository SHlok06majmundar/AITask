import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function POST() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    // Check if user already exists in profiles
    const existingProfile = await db.collection("profiles").findOne({ userId })

    const profileData = {
      userId,
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      imageUrl: user.imageUrl || "",
      createdAt: existingProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    if (existingProfile) {
      // Update existing profile
      await db.collection("profiles").updateOne({ userId }, { $set: profileData })
    } else {
      // Create new profile
      await db.collection("profiles").insertOne(profileData)
    }

    return NextResponse.json({ success: true, message: "Profile synced successfully" })
  } catch (error) {
    console.error("Error syncing user profile:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
