'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user?.email) {
        setEmail(user.email)
      }
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    setIsLoading(true)

    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error logging out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (
      !confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      return
    }

    setIsLoading(true)

    try {
      await supabase.auth.signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error(
        'Error deleting account:',
        error
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-bold text-foreground">
          Settings
        </h1>

        <p className="text-muted-foreground">
          Manage your account
        </p>
      </div>

      <div className="flex-1 overflow-auto p-6 max-w-4xl w-full mx-auto">
        <div className="space-y-6">

          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle>
                Account Settings
              </CardTitle>

              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">
                  Email Address
                </Label>

                <Input
                  id="email"
                  type="email"
                  disabled
                  value={email}
                  className="bg-muted/50"
                />

                <p className="text-xs text-muted-foreground">
                  Signed in account email
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card>
            <CardHeader>
              <CardTitle>
                Danger Zone
              </CardTitle>

              <CardDescription>
                Irreversible actions
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading
                  ? 'Logging out...'
                  : 'Logout'}
              </Button>

              <div>
                <Button
                  variant="destructive"
                  onClick={
                    handleDeleteAccount
                  }
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading
                    ? 'Deleting...'
                    : 'Delete Account'}
                </Button>

                <p className="text-xs text-destructive mt-2">
                  This action will permanently
                  delete your account and all
                  your notes.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}