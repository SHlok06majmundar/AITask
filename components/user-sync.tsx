"use client"

import { useUser } from "@clerk/nextjs"
import { useEffect } from "react"

export function UserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    if (isLoaded && user) {
      // Sync user data with our database
      fetch("/api/users/sync", {
        method: "POST",
      }).catch(console.error)
    }
  }, [isLoaded, user])

  return null
}
