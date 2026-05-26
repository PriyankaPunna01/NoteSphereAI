'use client'

import { User } from '@supabase/supabase-js'

import { Button } from '@/components/ui/button'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

import { createClient } from '@/lib/supabase/client'

import { useRouter } from 'next/navigation'

import {
  LogOut,
  Settings,
  User as UserIcon,
  Menu,
} from 'lucide-react'

interface HeaderProps {
  user: User
  onToggleSidebar?: () => void
}

export function Header({
  user,
  onToggleSidebar,
}: HeaderProps) {

  const router = useRouter()

  const supabase = createClient()

  const handleLogout = async () => {

    await supabase.auth.signOut()

    router.push('/auth/login')
  }

  const userInitials =
    user.email
      ?.substring(0, 2)
      .toUpperCase() || 'U'

  return (

    <header className="border-b border-border bg-card flex items-center justify-between px-3 sm:px-6 py-4">

      {/* LEFT SECTION */}
      <div className="flex items-center gap-3">

        {/* TOGGLE BUTTON */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebar}
        >

          <Menu className="w-6 h-6" />

        </Button>

        <h1 className="text-xl font-bold">
          NoteSphere
        </h1>

      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-4">

        <DropdownMenu>

          <DropdownMenuTrigger asChild>

            <Button
              variant="ghost"
              className="
                relative
                w-10
                h-10
                rounded-full
                bg-primary
                text-primary-foreground
              "
            >

              {userInitials}

            </Button>

          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56"
          >

            <div className="flex flex-col space-y-1 p-2">

              <p className="text-sm font-medium text-foreground break-all">

                {user.email}

              </p>

              <p className="text-xs text-muted-foreground">

                Account

              </p>

            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem>

              <UserIcon className="mr-2 h-4 w-4" />

              <span>Profile</span>

            </DropdownMenuItem>

            <DropdownMenuItem>

              <Settings className="mr-2 h-4 w-4" />

              <span>Settings</span>

            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={handleLogout}
            >

              <LogOut className="mr-2 h-4 w-4" />

              <span>Logout</span>

            </DropdownMenuItem>

          </DropdownMenuContent>

        </DropdownMenu>

      </div>

    </header>
  )
}