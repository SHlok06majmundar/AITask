"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Users, Mail, Copy, Trash2, UserPlus, Clock } from "lucide-react"
import { toast } from "sonner"

interface TeamMember {
  _id: string
  userId: string
  email: string
  name: string
  role: "admin" | "member"
  joinedAt: string
  avatar?: string
}

interface TeamInvite {
  _id: string
  email: string
  token: string
  invitedBy: string
  invitedByName: string
  createdAt: string
  status: "pending" | "accepted" | "expired"
}

export default function TeamPage() {
  const { user } = useUser()
  const [members, setMembers] = useState<TeamMember[]>([])
  const [invites, setInvites] = useState<TeamInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)

  const fetchTeamData = async () => {
    try {
      const [membersRes, invitesRes] = await Promise.all([fetch("/api/team/members"), fetch("/api/team/invites")])

      if (membersRes.ok) {
        const membersData = await membersRes.json()
        setMembers(membersData)
      }

      if (invitesRes.ok) {
        const invitesData = await invitesRes.json()
        setInvites(invitesData)
      }
    } catch (error) {
      console.error("Error fetching team data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTeamData()
    const interval = setInterval(fetchTeamData, 5000) // Real-time updates every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const sendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error("Please enter an email address")
      return
    }

    if (!inviteEmail.includes("@")) {
      toast.error("Please enter a valid email address")
      return
    }

    setInviting(true)
    try {
      const response = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        setInviteEmail("")
        fetchTeamData()
        toast.success("Invitation sent! Share the invite link.")

        // Copy invite link to clipboard
        const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/team/join/${data.token}`
        navigator.clipboard.writeText(inviteLink)
        toast.success("Invite link copied to clipboard!")
      } else {
        toast.error(data.error || "Failed to send invitation")
      }
    } catch (error) {
      toast.error("Failed to send invitation")
    } finally {
      setInviting(false)
    }
  }

  const copyInviteLink = (token: string) => {
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/team/join/${token}`
    navigator.clipboard.writeText(inviteLink)
    toast.success("Invite link copied to clipboard!")
  }

  const cancelInvite = async (inviteId: string) => {
    try {
      const response = await fetch(`/api/team/invites/${inviteId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTeamData()
        toast.success("Invitation cancelled")
      } else {
        toast.error("Failed to cancel invitation")
      }
    } catch (error) {
      toast.error("Failed to cancel invitation")
    }
  }

  const removeMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team/members/${memberId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTeamData()
        toast.success("Member removed from team")
      } else {
        toast.error("Failed to remove member")
      }
    } catch (error) {
      toast.error("Failed to remove member")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const currentUserMember = members.find((m) => m.userId === user?.id)
  const isAdmin = currentUserMember?.role === "admin"

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and invitations</p>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-medium">{members.length} members</span>
        </div>
      </div>

      {/* Invite New Member */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Team Member
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && sendInvite()}
                className="flex-1"
              />
              <Button onClick={sendInvite} disabled={inviting}>
                {inviting ? "Sending..." : "Send Invite"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              An invite link will be generated that you can share with the team member.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Pending Invitations */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pending Invitations ({invites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invites.map((invite) => (
                <div key={invite._id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited by {invite.invitedByName} • {new Date(invite.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-yellow-600">
                      Pending
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => copyInviteLink(invite.token)}>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy Link
                    </Button>
                    {isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 bg-transparent"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Invitation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel the invitation for {invite.email}?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => cancelInvite(invite._id)}>
                              Yes, Cancel Invitation
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Members ({members.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {members.map((member) => (
              <div key={member._id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={member.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {member.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {new Date(member.joinedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
                  {member.userId === user?.id && <Badge variant="outline">You</Badge>}
                  {isAdmin && member.userId !== user?.id && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to remove {member.name} from the team?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => removeMember(member._id)}>Remove Member</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
