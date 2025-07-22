import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getCollection } from "@/lib/mongodb"

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profilesCollection = await getCollection("profiles")
    const profile = await profilesCollection.findOne({ userId })

    if (!profile) {
      // Create profile if it doesn't exist
      const user = await currentUser()
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      const newProfile = {
        userId: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || null,
        imageUrl: user.imageUrl || null,
        role: "member",
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await profilesCollection.insertOne(newProfile)
      return NextResponse.json(newProfile)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
