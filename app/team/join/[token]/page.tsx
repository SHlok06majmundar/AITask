"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface InviteData {
  email: string
  role: string
  teamName: string
  invitedBy: string
  status: string
}

export default function JoinTeamPage({ params }: { params: { token: string } }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [inviteData, setInviteData] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)

  useEffect(() => {
    if (isLoaded) {
      fetchInviteData()
    }
  }, [isLoaded, params.token])

  const fetchInviteData = async () => {
    try {
      const response = await fetch(`/api/team/join/${params.token}`)
      if (response.ok) {
        const data = await response.json()
        setInviteData(data)
      } else {
        toast.error("Invalid or expired invitation link")
        router.push("/")
      }
    } catch (error) {
      toast.error("Failed to load invitation")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptInvite = async () => {
    if (!user) {
      router.push("/sign-in")
      return
    }

    setAccepting(true)
    try {
      const response = await fetch(`/api/team/join/${params.token}`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success("Successfully joined the team!")
        router.push("/team")
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to join team")
      }
    } catch (error) {
      toast.error("Failed to join team")
    } finally {
      setAccepting(false)
    }
  }

  const handleDeclineInvite = () => {
    toast.success("Invitation declined")
    router.push("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <X className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Invitation</h2>
            <p className="text-gray-600 dark:text-gray-400">This invitation link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
          <CardDescription>You've been invited to join a team on SyncSphere</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>{inviteData.invitedBy}</strong> has invited you to join as a
            </p>
            <Badge className="text-sm px-3 py-1">{inviteData.role}</Badge>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">What you'll get:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Access to team tasks and projects</li>
              <li>• Real-time collaboration tools</li>
              <li>• Team analytics and insights</li>
              <li>• Shared calendar and events</li>
            </ul>
          </div>

          {!user ? (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Please sign in to accept this invitation
              </p>
              <Button onClick={() => router.push("/sign-in")} className="w-full">
                Sign In to Accept
              </Button>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button onClick={handleAcceptInvite} disabled={accepting} className="flex-1">
                {accepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Accept
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleDeclineInvite}
                disabled={accepting}
                className="flex-1 bg-transparent"
              >
                <X className="h-4 w-4 mr-2" />
                Decline
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
