'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import {
  Home,
  Archive,
  Trash2,
  Bell,
  CheckSquare,
  Settings,
  Menu,
  X,
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

export function Sidebar({
  user,
}: {
  user?: any
}) {

  const pathname = usePathname()

  const [open, setOpen] = useState(false)

  return (
    <>
      
      {/* TOP BAR */}
      <div className="w-full h-16 bg-white border-b flex items-center px-4 fixed top-0 left-0 z-30">

        <button
          onClick={() => setOpen(true)}
        >
          <Menu className="w-7 h-7 text-black" />
        </button>

        <h1 className="ml-4 text-xl font-bold text-black">
          NoteSphere
        </h1>

      </div>

      {/* OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* DRAWER */}
      <div
        className={`
          fixed
          top-0
          left-0
          h-screen
          w-[82%]
          max-w-[320px]
          bg-[#F5F5F5]
          z-50
          rounded-r-3xl
          shadow-2xl
          transition-transform
          duration-300
          flex
          flex-col
          ${
            open
              ? 'translate-x-0'
              : '-translate-x-full'
          }
        `}
      >

        {/* HEADER */}
        <div className="bg-blue-700 rounded-tr-3xl h-56 flex flex-col items-center justify-center relative px-4">

          <button
            className="absolute top-5 right-5"
            onClick={() => setOpen(false)}
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* PROFILE */}
          <div className="w-20 h-20 rounded-full bg-white mb-4 flex items-center justify-center">

            <span className="text-3xl font-bold text-blue-700">
              {user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </span>

          </div>

          {/* USERNAME */}
          <h2
            className="
              text-white
              text-xl
              font-bold
              text-center
              leading-7
              max-w-[220px]
              truncate
            "
          >
            {user?.email?.split('@')[0] || 'User'}
          </h2>

          {/* EMAIL */}
          <p
            className="
              text-white/90
              text-sm
              mt-1
              text-center
              truncate
              max-w-[240px]
            "
          >
            {user?.email}
          </p>

        </div>

        {/* MENU */}
        <div className="flex-1 px-6 py-6 space-y-6 overflow-y-auto">

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
                  pathname.startsWith(href)
                )

              return (

                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`
                    flex
                    items-center
                    gap-4
                    text-lg
                    font-medium
                    transition-all
                    ${
                      isActive
                        ? 'text-blue-600'
                        : 'text-black'
                    }
                  `}
                >

                  <Icon className="w-6 h-6" />

                  {label}

                </Link>

              )
            }
          )}

        </div>

        {/* SETTINGS */}
        <div className="border-t px-6 py-5">

          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="
              flex
              items-center
              gap-4
              text-lg
              text-black
              font-medium
            "
          >

            <Settings className="w-6 h-6" />

            Settings

          </Link>

        </div>

      </div>
    </>
  )
}