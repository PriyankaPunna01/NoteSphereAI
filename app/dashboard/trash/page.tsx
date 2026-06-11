'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { useExitPrompt } from '@/hooks/useExitPrompt'

type Note = {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function TrashPage() {
    useExitPrompt()
  
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadDeletedNotes() {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('is_deleted', true)
          .order('updated_at', { ascending: false })

        if (error) throw error
        setNotes(data || [])
      } catch (error) {
        console.error('Error loading deleted notes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDeletedNotes()
  }, [supabase])

  const handleRestore = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_deleted: false })
        .eq('id', noteId)

      if (error) throw error
      setNotes(notes.filter((note) => note.id !== noteId))
    } catch (error) {
      console.error('Error restoring note:', error)
    }
  }

  const handlePermanentlyDelete = async (noteId: string) => {
    if (!confirm('This will permanently delete the note. Are you sure?')) return

    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)

      if (error) throw error
      setNotes(notes.filter((note) => note.id !== noteId))
    } catch (error) {
      console.error('Error permanently deleting note:', error)
    }
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full">

      {/* HEADER */}
      <div className="border-b border-border px-4 sm:px-6 py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3 sm:mb-4">
          Trash
        </h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 w-full sm:max-w-md">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            type="text"
            placeholder="Search deleted notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:outline-none text-sm"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-4 sm:py-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-sm">
              Loading deleted notes...
            </p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <svg
              className="w-16 h-16 sm:w-24 sm:h-24 text-muted-foreground/30 mb-4 sm:mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M19 13l-7 -7 -7 7M19 13v6a2 2 0 0 1 -2 2H7a2 2 0 0 1 -2 -2v-6"
              />
            </svg>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              Trash is empty
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Deleted notes will appear here and can be restored or permanently removed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className="border border-border rounded-2xl p-4 bg-background flex flex-col gap-3 shadow-sm"
              >

                {/* NOTE INFO */}
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base leading-snug line-clamp-2">
                    {note.title || 'Untitled'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(note.created_at).toLocaleDateString()}
                  </p>
                  {note.content && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2 line-clamp-3">
                      {note.content.substring(0, 100)}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRestore(note.id)}
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-blue-600 text-white rounded-full active:opacity-80"
                  >
                    Restore
                  </button>
                  <button
                    onClick={() => handlePermanentlyDelete(note.id)}
                    className="flex-1 px-3 py-2 text-xs font-semibold bg-red-100 text-red-600 rounded-full active:opacity-80"
                  >
                    Delete Forever
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}