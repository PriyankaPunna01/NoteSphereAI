'use client'

import {
  Edit2,
  Trash2,
  Pin,
  Archive,
} from 'lucide-react'

import Link from 'next/link'

interface NoteCardProps {
  note: {
    id: string
    title: string
    date: string
    description: string
    summary?: string
    tags: string[]
    is_pinned?: boolean
    category?: string
  }

  onDelete?: () => void
  onEdit?: () => void
  onArchive?: () => void

  onTogglePin?: (
    id: string,
    currentValue: boolean
  ) => void
}

const getCategoryConfig = (
  category?: string
) => {

  switch (category) {

    case 'Study':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        dot: 'bg-blue-400',
      }

    case 'Work':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        dot: 'bg-emerald-400',
      }

    case 'Personal':
      return {
        bg: 'bg-violet-50',
        text: 'text-violet-600',
        border: 'border-violet-200',
        dot: 'bg-violet-400',
      }

    case 'Ideas':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        dot: 'bg-amber-400',
      }

    case 'Projects':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-600',
        border: 'border-rose-200',
        dot: 'bg-rose-400',
      }

    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-500',
        border: 'border-gray-200',
        dot: 'bg-gray-400',
      }
  }
}

export function NoteCard({
  note,
  onDelete,
  onEdit,
  onArchive,
  onTogglePin,
}: NoteCardProps) {

  const categoryConfig =
    getCategoryConfig(note.category)

  return (

    <Link
      href={`/dashboard/note/${note.id}`}
      className="block h-full"
    >

      <div
        className={`
          relative flex flex-col h-full
          bg-card border border-border rounded-2xl
          p-5 gap-3
          hover:border-foreground/20 hover:shadow-md
          transition-all duration-200 ease-in-out
          group cursor-pointer
          ${
            note.is_pinned
              ? 'ring-1 ring-foreground/10'
              : ''
          }
        `}
      >

        {/* Pinned indicator */}
        {note.is_pinned && (

          <div className="absolute top-0 left-6 right-6 h-0.5 bg-foreground/20 rounded-b-full" />

        )}

        {/* Top Row */}
        <div className="flex items-center justify-between">

          {note.category ? (

            <span
              className={`
                inline-flex items-center gap-1.5 px-2.5 py-1
                rounded-full text-xs font-medium tracking-wide
                border
                ${categoryConfig.bg}
                ${categoryConfig.text}
                ${categoryConfig.border}
              `}
            >

              <span
                className={`
                  w-1.5 h-1.5 rounded-full
                  ${categoryConfig.dot}
                `}
              />

              {note.category}

            </span>

          ) : (
            <span />
          )}

          <button
            onClick={(e) => {

              e.preventDefault()

              onTogglePin?.(
                note.id,
                note.is_pinned ?? false
              )
            }}
            className={`
              p-1.5 rounded-lg transition-all duration-150
              ${
                note.is_pinned
                  ? 'text-foreground bg-secondary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }
            `}
          >

            <Pin
              className={`
                w-3.5 h-3.5 transition-all
                ${
                  note.is_pinned
                    ? 'fill-foreground'
                    : ''
                }
              `}
            />

          </button>

        </div>

        {/* Title */}
        <div>

          <h3 className="font-semibold text-foreground text-base leading-snug line-clamp-2">
            {note.title}
          </h3>

          <p className="text-xs text-muted-foreground mt-1 font-normal">
            {note.date}
          </p>

        </div>

        {/* Divider */}
        <div className="border-t border-border/60" />

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {note.summary || note.description}
        </p>

        {/* Tags */}
        {note.tags.length > 0 && (

          <div className="flex items-center gap-1.5 flex-wrap">

            {note.tags
              .slice(0, 3)
              .map((tag) => (

                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 bg-secondary text-xs text-muted-foreground rounded-md"
                >
                  #{tag}
                </span>

              ))}

          </div>

        )}

        {/* Action Buttons */}
        <div
          className="
            flex items-center gap-1 pt-1
            opacity-0 group-hover:opacity-100
            transition-opacity duration-150
            border-t border-border/40
          "
        >

          {/* Edit */}
          {onEdit && (

            <button
              onClick={(e) => {

                e.preventDefault()

                onEdit()
              }}
              className="
                flex items-center gap-1.5 px-2.5 py-1.5
                text-xs text-muted-foreground
                hover:text-foreground hover:bg-secondary/70
                rounded-lg transition-all duration-150
              "
            >

              <Edit2 className="w-3.5 h-3.5" />

              Edit

            </button>

          )}

          {/* Archive */}
          {onArchive && (

            <button
              onClick={(e) => {

                e.preventDefault()

                onArchive()
              }}
              className="
                flex items-center gap-1.5 px-2.5 py-1.5
                text-xs text-muted-foreground
                hover:text-blue-600 hover:bg-blue-100
                rounded-lg transition-all duration-150
              "
            >

              <Archive className="w-3.5 h-3.5" />

              Archive

            </button>

          )}

          {/* Delete */}
          {onDelete && (

            <button
              onClick={(e) => {

                e.preventDefault()

                onDelete()
              }}
              className="
                flex items-center gap-1.5 px-2.5 py-1.5
                text-xs text-muted-foreground
                hover:text-destructive hover:bg-destructive/10
                rounded-lg transition-all duration-150
                ml-auto
              "
            >

              <Trash2 className="w-3.5 h-3.5" />

              Delete

            </button>

          )}

        </div>

      </div>

    </Link>
  )
}