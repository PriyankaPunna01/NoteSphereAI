'use client'

import { Plus, Mic, Code2, Zap } from 'lucide-react'

interface FloatingActionButtonProps {
  isOpen: boolean
  onToggle: () => void
}

export function FloatingActionButton({
  isOpen,
  onToggle,
}: FloatingActionButtonProps) {
  const menuItems = [
    {
      id: 1,
      label: 'Voice Note',
      icon: Mic,
      color: 'from-blue-500 to-cyan-500',
      shortcut: '⌘V',
    },
    {
      id: 2,
      label: 'Code Snippet',
      icon: Code2,
      color: 'from-purple-500 to-pink-500',
      shortcut: '⌘C',
    },
    {
      id: 3,
      label: 'Canvas',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      shortcut: '⌘K',
    },
  ]

  return (
    <div className="fixed bottom-8 right-8 z-40">
      {/* Menu Items - Staggered Animation */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {menuItems.map((item, index) => (
            <div
              key={item.id}
              className="group flex items-center gap-3 animate-in fade-in slide-in-from-right-2 duration-300"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="backdrop-blur-md bg-card/40 border border-border/20 rounded-lg px-4 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap text-sm">
                <span className="text-muted-foreground">{item.label}</span>
              </div>

              <button
                className={`p-4 bg-gradient-to-br ${item.color} rounded-full shadow-lg hover:shadow-2xl hover:scale-110 transition-all transform hover:-translate-y-1 text-white group-hover:opacity-90`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={onToggle}
        className={`relative p-4 rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background ${
          isOpen
            ? 'bg-gradient-to-br from-primary to-accent text-white'
            : 'bg-gradient-to-br from-primary to-accent text-white hover:shadow-3xl'
        }`}
        aria-label="Create new note"
      >
        <div
          className={`transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
        >
          <Plus className="w-6 h-6" />
        </div>

        {/* Glow Effect */}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-0 animate-pulse blur-md" />
        )}
      </button>

      {/* Backdrop overlay when menu is open */}
      {isOpen && (
        <button
          onClick={onToggle}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1] animate-in fade-in duration-300"
          aria-label="Close menu"
        />
      )}
    </div>
  )
}
