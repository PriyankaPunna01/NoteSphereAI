'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NoteCard } from '@/components/notes/note-card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Button as UIButton } from '@/components/ui/button'

type Note = {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export default function TrashPage() {
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
      <div className="border-b border-border p-6">
        <h1 className="text-2xl font-bold text-foreground mb-4">Trash</h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search deleted notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading deleted notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <svg
              className="w-24 h-24 text-muted-foreground/30 mb-6"
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
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Trash is empty
            </h2>
            <p className="text-muted-foreground text-center max-w-sm">
              Deleted notes will appear here and can be restored or permanently removed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={{
                  id: note.id,
                  title: note.title,
                  description: note.content?.substring(0, 100) || '',
                  date: new Date(note.created_at).toLocaleDateString(),
                  tags: [],
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
