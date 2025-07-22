"use client"

import { useEffect } from "react"
import { useUser } from "@clerk/nextjs"

export function UserSync() {
  const { user, isLoaded } = useUser()

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user) {
        try {
          await fetch("/api/users/sync", {
            method: "POST",
          })
        } catch (error) {
          console.error("Error syncing user:", error)
        }
      }
    }

    syncUser()
  }, [user, isLoaded])

  return null
}
