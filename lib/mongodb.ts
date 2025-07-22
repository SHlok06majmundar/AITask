import { MongoClient, type Db, type Collection } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// Database and collection helpers
export async function getDatabase(): Promise<Db> {
  const client = await clientPromise
  return client.db("syncsphere")
}

export async function getCollection(name: string): Promise<Collection> {
  const db = await getDatabase()
  return db.collection(name)
}

// Types for our database
export interface Profile {
  _id?: string
  userId: string
  email: string
  fullName: string | null
  imageUrl: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  _id?: string
  name: string
  description: string | null
  color: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
}

export interface Task {
  _id?: string
  title: string
  description: string | null
  status: "todo" | "in_progress" | "review" | "done"
  priority: "low" | "medium" | "high"
  assigneeId: string | null
  projectId: string | null
  dueDate: Date | null
  completedAt: Date | null
  createdBy: string
  createdAt: Date
  updatedAt: Date
  assignee?: Profile
  project?: Project
}

export interface ActivityLog {
  _id?: string
  userId: string
  action: string
  entityType: string
  entityId: string
  metadata: any
  createdAt: Date
  user?: Profile
}
