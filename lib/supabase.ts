import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  color: string
  owner_id: string
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: "todo" | "in_progress" | "review" | "done"
  priority: "low" | "medium" | "high"
  assignee_id: string | null
  project_id: string | null
  due_date: string | null
  completed_at: string | null
  created_by: string
  created_at: string
  updated_at: string
  assignee?: Profile
  project?: Project
}

export interface ActivityLog {
  id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  metadata: any
  created_at: string
  user?: Profile
}
