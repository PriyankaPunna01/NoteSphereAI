'use client'

import { Plus } from 'lucide-react'

interface AddNoteButtonProps {
  onClick: () => void
}

export function AddNoteButton({ onClick }: AddNoteButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
    >
      <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-200" />
    </button>
  )
}
