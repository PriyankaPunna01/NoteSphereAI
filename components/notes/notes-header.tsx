'use client'

import { Search } from 'lucide-react'

interface NotesHeaderProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function NotesHeader({
  searchQuery,
  onSearchChange,
}: NotesHeaderProps) {
  return (
    <header className="border-b border-border bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Notes</h1>

        <div className="flex items-center gap-4 flex-1 max-w-md mx-auto">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search Notes"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm">
            TU
          </div>
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
