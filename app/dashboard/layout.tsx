'use client'

import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [showSidebar, setShowSidebar] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Fetch the real logged-in user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* SIDEBAR */}
      {showSidebar && <Sidebar />}

      {/* MAIN CONTENT */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {user && (
          <Header
            user={user}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>

      </div>
    </div>
  )
}
