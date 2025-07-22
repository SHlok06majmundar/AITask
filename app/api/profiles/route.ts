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

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const { userId } = auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profilesCollection = await getCollection("profiles")

    const existingProfile = await profilesCollection.findOne({ userId })
    if (existingProfile) {
      return NextResponse.json(existingProfile)
    }

    const newProfile = {
      userId,
      email: user.emailAddresses[0]?.emailAddress || "",
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      imageUrl: user.imageUrl,
      role: "member",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await profilesCollection.insertOne(newProfile)
    const createdProfile = await profilesCollection.findOne({ _id: result.insertedId })

    return NextResponse.json(createdProfile, { status: 201 })
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
