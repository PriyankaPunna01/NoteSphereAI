'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'

import { createClient } from '@/lib/supabase/client'

import { Sidebar } from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {

  const [user, setUser] =
    useState<User | null>(null)

  const supabase = createClient()

  useEffect(() => {

    const getUser = async () => {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      setUser(user)
    }

    getUser()

  }, [])

  return (

    <div className="w-full min-h-screen bg-white">

      {/* SIDEBAR */}
      <Sidebar user={user} />

      {/* MAIN CONTENT */}
      <main
        className="
          pt-20
          px-4
          pb-6
          w-full
          min-h-screen
          overflow-y-auto
        "
      >
        {children}
      </main>

    </div>

  )
}