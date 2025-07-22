import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()
    const profile = await db.collection("profiles").findOne({ userId })

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST() {
  try {
    const { userId } = await auth()
    const user = await currentUser()

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = await getDatabase()

    const existingProfile = await db.collection("profiles").findOne({ userId })
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

    const result = await db.collection("profiles").insertOne(newProfile)
    const createdProfile = await db.collection("profiles").findOne({ _id: result.insertedId })

    return NextResponse.json(createdProfile, { status: 201 })
  } catch (error) {
    console.error("Error creating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
