'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { NoteCard } from '@/components/notes/note-card'
import { AddNoteButton } from '@/components/notes/add-note-button'
import { AddNoteModal } from '@/components/notes/add-note-modal'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'

type Note = {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  is_pinned: boolean
  category: string
  ai_summary?: string
}

export default function DashboardPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [overallSummary, setOverallSummary] = useState('')
  const [isSummarizingAll, setIsSummarizingAll] = useState(false)

  const supabase = createClient()
  const pathname = usePathname()

  const loadNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('is_deleted', false)
        .eq('is_archived', false)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false })

      if (error) throw error
      setNotes(data || [])
    } catch (error) {
      console.error('Error loading notes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Re-fetch every time the user lands on this page (including coming back from note editor)
  useEffect(() => {
    loadNotes()
  }, [pathname])

  const handleAddNote = async (newNote: {
    title: string
    content: string
    tags: string[]
    category: string
  }) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      // 1. Insert note
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          user_id: user.id,
          title: newNote.title,
          content: newNote.content,
          category: newNote.category,
          is_pinned: false,
        }])
        .select()

      if (error) throw error
      if (!data || data.length === 0) return

      const createdNote = data[0]

      // 2. Optimistically add note to state immediately (no summary yet)
      setNotes((prev) => [{ ...createdNote, ai_summary: '' }, ...prev])
      setIsAddModalOpen(false)

      // 3. Generate AI summary in background
      const response = await fetch('/api/analyze-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: createdNote.content }),
      })

      const result = await response.json()
      const summary = result.summary || ''
      const category = result.category || newNote.category

      // 4. Save summary to DB
      await supabase
        .from('notes')
        .update({ ai_summary: summary, category })
        .eq('id', createdNote.id)

      // 5. Update local state directly — no re-fetch needed
      setNotes((prev) =>
        prev.map((n) =>
          n.id === createdNote.id
            ? { ...n, ai_summary: summary, category }
            : n
        )
      )
    } catch (error) {
      console.error('Error adding note:', error)
    }
  }

  const handleArchiveNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_archived: true })
        .eq('id', noteId)
      if (error) throw error
      setNotes(notes.filter((note) => note.id !== noteId))
    } catch (error) {
      console.error('Error archiving note:', error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
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

  const handleTogglePin = async (noteId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ is_pinned: !currentValue })
        .eq('id', noteId)
      if (error) throw error
      setNotes(notes.map((note) =>
        note.id === noteId ? { ...note, is_pinned: !currentValue } : note
      ))
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  const handleSummarizeAllNotes = async () => {
    if (notes.length === 0) { alert('No notes available.'); return }

    const combinedContent = notes
      .map((note) =>
        `Title: ${note.title}\n` +
        `Category: ${note.category || ''}\n` +
        `Summary: ${note.ai_summary || ''}\n` +
        `Content: ${note.content || ''}`
      )
      .join('\n\n----------------\n\n')

    setIsSummarizingAll(true)
    try {
      const res = await fetch('/api/analyze-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: combinedContent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to summarize notes.')
      setOverallSummary(data.summary || '')
    } catch (error) {
      console.error('Error summarizing all notes:', error)
      alert('Failed to summarize all notes.')
    } finally {
      setIsSummarizingAll(false)
    }
  }

  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const category = note.category || 'Uncategorized'
    if (!groups[category]) groups[category] = []
    groups[category].push(note)
    return groups
  }, {} as Record<string, Note[]>)

  return (
    <div className="flex flex-col h-full w-full overflow-x-hidden">

      {/* Top Section */}
      <div className="border-b border-border p-3 sm:p-6">

        {/* Search */}
        <div className="w-full max-w-md flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-0 focus-visible:ring-0 focus-visible:outline-none"
          />
        </div>

        {/* AI Summary Button */}
        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            onClick={handleSummarizeAllNotes}
            disabled={isSummarizingAll}
            className="w-full sm:w-auto"
          >
            {isSummarizingAll ? 'Summarizing...' : '🤖 Summarize All Notes'}
          </Button>
        </div>

        {/* Overall Summary */}
        {overallSummary && (
          <div className="mt-4 p-4 border rounded-xl bg-muted w-full">
            <h3 className="font-semibold mb-2">📚 Overall Summary</h3>
            <textarea
              value={overallSummary}
              onChange={(e) => setOverallSummary(e.target.value)}
              className="w-full min-h-[150px] p-3 border rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Notes Section */}
      <div className="flex-1 overflow-auto p-3 sm:p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Loading notes...</p>
          </div>

        ) : filteredNotes.length === 0 && searchQuery === '' ? (
          <EmptyState />

        ) : filteredNotes.length === 0 ? (
          <NoSearchResults />

        ) : (
          <div className="space-y-8">
            {Object.entries(groupedNotes).map(([category, categoryNotes]) => (
              <div key={category}>
                <h2 className="text-xl sm:text-2xl font-bold mb-4">{category}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryNotes.map((note) => (
                    <div key={note.id} className="w-full">
                      <NoteCard
                        note={{
                          id: note.id,
                          title: note.title,
                          description:
                            note.ai_summary ||
                            note.content?.substring(0, 100) ||
                            '',
                          date: new Date(note.created_at).toLocaleDateString(),
                          tags: [],
                          is_pinned: note.is_pinned,
                          category: note.category,
                        }}
                        onDelete={() => handleDeleteNote(note.id)}
                        onTogglePin={handleTogglePin}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddNoteButton onClick={() => setIsAddModalOpen(true)} />

      <AddNoteModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNote}
      />
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-semibold text-foreground mb-2">No notes yet</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Click the Add button to create your first note.
      </p>
    </div>
  )
}

function NoSearchResults() {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <h2 className="text-2xl font-semibold text-foreground mb-2">No notes found</h2>
      <p className="text-muted-foreground text-center max-w-sm">
        Try adjusting your search query.
      </p>
    </div>
  )
}
