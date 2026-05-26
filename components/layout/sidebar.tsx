'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  FileText,
  Archive,
  Trash2,
  Settings,
  Home,
  Bell,
  CheckSquare,
} from 'lucide-react'

const navItems = [
  {
    href: '/dashboard',
    label: 'Notes',
    icon: Home,
  },
  {
    href: '/dashboard/archive',
    label: 'Archive',
    icon: Archive,
  },
  {
    href: '/dashboard/trash',
    label: 'Trash',
    icon: Trash2,
  },
  {
    href: '/dashboard/reminders',
    label: 'Reminders',
    icon: Bell,
  },
  {
    href: '/dashboard/tasks',
    label: 'Tasks',
    icon: CheckSquare,
  },
]

const bottomItems = [
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
  },
]

export function Sidebar() {

  const pathname = usePathname()

  return (

    <aside className="w-64 h-screen border-r border-border bg-white flex flex-col">

      {/* LOGO */}
      <div className="p-6 border-b border-border">

        <Link
          href="/"
          className="flex items-center gap-2"
        >

          <FileText className="w-6 h-6 text-primary" />

          <h1 className="text-xl font-bold">
            NoteSphere
          </h1>

        </Link>

      </div>

      {/* MAIN NAVIGATION */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">

        {navItems.map(
          ({
            href,
            label,
            icon: Icon,
          }) => {

            const isActive =
              pathname === href ||
              (
                href !== '/dashboard' &&
                pathname.startsWith(
                  href
                )
              )

            return (

              <Link
                key={href}
                href={href}
                className={`
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  transition-all
                  ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-foreground hover:bg-muted'
                  }
                `}
              >

                <Icon className="w-5 h-5" />

                <span>{label}</span>

              </Link>

            )
          }
        )}

      </nav>

      {/* BOTTOM NAVIGATION */}
      <nav className="p-4 border-t border-border">

        {bottomItems.map(
          ({
            href,
            label,
            icon: Icon,
          }) => {

            const isActive =
              pathname === href

            return (

              <Link
                key={href}
                href={href}
                className={`
                  flex
                  items-center
                  gap-3
                  px-4
                  py-3
                  rounded-xl
                  transition-all
                  ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-foreground hover:bg-muted'
                  }
                `}
              >

                <Icon className="w-5 h-5" />

                <span>{label}</span>

              </Link>

            )
          }
        )}

      </nav>

    </aside>
  )
}