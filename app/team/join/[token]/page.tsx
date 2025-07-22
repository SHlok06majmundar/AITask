"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Mail, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"

interface InviteData {
  email: string
  invitedBy: string
  invitedByName: string
  createdAt: string
  status: string
  teamName?: string
}

export default function JoinTeamPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const [invite, setInvite] = useState<InviteData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState("")

  const token = params.token as string

  useEffect(() => {
    if (isLoaded && token) {
      fetchInviteData()
    }
  }, [isLoaded, token])

  const fetchInviteData = async () => {
    try {
      const response = await fetch(`/api/team/join/${token}`)
      const data = await response.json()

      if (response.ok) {
        setInvite(data)
      } else {
        setError(data.error || "Invalid or expired invitation")
      }
    } catch (error) {
      setError("Failed to load invitation")
    } finally {
      setLoading(false)
    }
  }

  const acceptInvite = async () => {
    if (!user) {
      router.push("/sign-in")
      return
    }

    setProcessing(true)
    try {
      const response = await fetch(`/api/team/join/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept" }),
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
      setProcessing(false)
    }
  }

  const declineInvite = async () => {
    setProcessing(true)
    try {
      const response = await fetch(`/api/team/join/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "decline" }),
      })

      if (response.ok) {
        toast.success("Invitation declined")
        router.push("/")
      } else {
        toast.error("Failed to decline invitation")
      }
    } catch (error) {
      toast.error("Failed to decline invitation")
    } finally {
      setProcessing(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push("/")} variant="outline">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!invite) {
    return null
  }

  // Check if user email matches invite email
  const emailMatches = user?.emailAddresses?.[0]?.emailAddress === invite.email

  return (
    <div className="container mx-auto p-6 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <Users className="h-12 w-12 text-blue-500 mx-auto mb-2" />
          <CardTitle>Team Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">You've been invited to join SyncSphere!</p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{invite.email}</span>
              </div>
              <p>Invited by {invite.invitedByName}</p>
              <p>
                <Clock className="h-3 w-3 inline mr-1" />
                {new Date(invite.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge variant={invite.status === "pending" ? "default" : "secondary"}>{invite.status}</Badge>
          </div>

          {!user && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-3">Please sign in to accept this invitation</p>
              <Button onClick={() => router.push("/sign-in")} className="w-full">
                Sign In
              </Button>
            </div>
          )}

          {user && !emailMatches && (
            <div className="text-center">
              <p className="text-sm text-red-600 mb-3">
                This invitation was sent to {invite.email}, but you're signed in as{" "}
                {user.emailAddresses?.[0]?.emailAddress}. Please sign in with the correct email address.
              </p>
              <Button onClick={() => router.push("/sign-in")} variant="outline" className="w-full">
                Sign In with Different Account
              </Button>
            </div>
          )}

          {user && emailMatches && invite.status === "pending" && (
            <div className="space-y-3">
              <Button onClick={acceptInvite} disabled={processing} className="w-full">
                {processing ? "Joining..." : "Accept Invitation"}
              </Button>
              <Button onClick={declineInvite} disabled={processing} variant="outline" className="w-full bg-transparent">
                {processing ? "Declining..." : "Decline"}
              </Button>
            </div>
          )}

          {invite.status === "accepted" && (
            <div className="text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-green-600 font-medium">Already accepted</p>
              <Button onClick={() => router.push("/team")} className="w-full mt-3">
                Go to Team
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
