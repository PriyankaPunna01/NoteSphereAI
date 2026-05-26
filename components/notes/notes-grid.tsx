'use client'

import { NoteCard } from './note-card'

interface Note {
  id: string
  title: string
  date: string
  description: string
  summary?: string
  tags: string[]
  icon?: string
  is_pinned?: boolean
}

interface NotesGridProps {
  notes: Note[]
  onTogglePin?: (id: string, currentValue: boolean) => void
}

export function NotesGrid({ notes, onTogglePin }: NotesGridProps) {
  const sortedNotes = [...notes].sort((a, b) => {
    if ((a.is_pinned ? 1 : 0) > (b.is_pinned ? 1 : 0)) return -1
    if ((a.is_pinned ? 1 : 0) < (b.is_pinned ? 1 : 0)) return 1
    return 0
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {sortedNotes.map((note) => (
        <NoteCard
          key={note.id}
          note={{
            ...note,
            summary: note.summary,
          }}
          onTogglePin={onTogglePin}
        />
      ))}
    </div>
  )
}