'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { NoteCard } from '@/components/notes/note-card'
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

export default function ArchivePage() {
  useExitPrompt()
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function loadArchivedNotes() {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('is_archived', true)
          .eq('is_deleted', false)
          .order('updated_at', { ascending: false })

        if (error) throw error
        setNotes(data || [])
      } catch (error) {
        console.error('Error loading archived notes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadArchivedNotes()
  }, [supabase])

  const handleUnarchive = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_archived: false })
        .eq('id', noteId)

      if (error) throw error
      setNotes(notes.filter((note) => note.id !== noteId))
    } catch (error) {
      console.error('Error unarchiving note:', error)
    }
  }

  const handleDelete = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_deleted: true })
        .eq('id', noteId)

      if (error) throw error
      setNotes(notes.filter((note) => note.id !== noteId))
    } catch (error) {
      console.error('Error deleting note:', error)
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
        <h1 className="text-2xl font-bold text-foreground mb-4">Archive</h1>
        <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 max-w-md">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search archived notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading archived notes...</p>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              No archived notes
            </h2>
            <p className="text-muted-foreground text-center max-w-sm">
              Archive notes to keep your dashboard clean while preserving them for later.
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
