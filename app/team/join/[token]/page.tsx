"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, Mail, Calendar, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

interface InvitationData {
  email: string
  role: string
  invitedBy: string
  invitedAt: string
}

export default function JoinTeamPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const token = params.token as string

  useEffect(() => {
    if (!isLoaded) return

    const fetchInvitation = async () => {
      try {
        const response = await fetch(`/api/team/join/${token}`)
        const data = await response.json()

        if (response.ok) {
          setInvitation(data)
        } else {
          setError(data.error || "Invalid invitation")
        }
      } catch (error) {
        setError("Failed to load invitation")
      } finally {
        setLoading(false)
      }
    }

    fetchInvitation()
  }, [token, isLoaded])

  const handleAcceptInvitation = async () => {
    if (!user) {
      toast.error("Please sign in to accept the invitation")
      return
    }

    setAccepting(true)
    try {
      const response = await fetch(`/api/team/join/${token}`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Successfully joined the team!")
        router.push("/team")
      } else {
        toast.error(data.error || "Failed to join team")
      }
    } catch (error) {
      toast.error("Failed to join team")
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading invitation...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
            <CardTitle>Team Invitation</CardTitle>
            <CardDescription>Please sign in to accept this team invitation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="font-medium">{invitation?.email}</p>
              <p className="text-sm text-muted-foreground">
                Invited as {invitation?.role} by {invitation?.invitedBy}
              </p>
            </div>
            <Button onClick={() => router.push("/sign-in")} className="w-full">
              Sign In to Accept
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl">
                  {invitation?.invitedBy
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-1">
                <Users className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          <CardTitle>You're Invited to Join the Team!</CardTitle>
          <CardDescription>{invitation?.invitedBy} has invited you to collaborate</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Email</span>
              </div>
              <span className="font-medium">{invitation?.email}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Role</span>
              </div>
              <Badge variant="secondary" className="capitalize">
                {invitation?.role}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Invited</span>
              </div>
              <span className="text-sm">
                {invitation?.invitedAt ? new Date(invitation.invitedAt).toLocaleDateString() : ""}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleAcceptInvitation} className="w-full" disabled={accepting}>
              {accepting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Joining Team...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Accept Invitation
                </>
              )}
            </Button>

            <Button variant="outline" onClick={() => router.push("/")} className="w-full">
              Maybe Later
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By accepting, you'll gain access to team tasks, projects, and collaboration tools.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
