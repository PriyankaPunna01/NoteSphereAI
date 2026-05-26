'use client'

import { Sparkles, Check } from 'lucide-react'

const suggestions = [
  {
    id: 1,
    title: 'TypeScript Generics',
    category: 'Learning',
    icon: '📚',
  },
  {
    id: 2,
    title: 'React Hooks Best Practices',
    category: 'Development',
    icon: '⚛️',
  },
  {
    id: 3,
    title: 'Database Indexing Strategy',
    category: 'Performance',
    icon: '⚡',
  },
  {
    id: 4,
    title: 'CSS Grid Layout Patterns',
    category: 'Design',
    icon: '🎨',
  },
  {
    id: 5,
    title: 'API Security Headers',
    category: 'Security',
    icon: '🔒',
  },
  {
    id: 6,
    title: 'Docker Optimization Tips',
    category: 'DevOps',
    icon: '🐳',
  },
]

export function SmartSuggestionsPanel() {
  return (
    <div className="sticky top-8 backdrop-blur-md bg-card/40 border border-border/20 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-accent/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-accent" />
        </div>
        <h3 className="text-lg font-semibold">Smart Suggestions</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        AI-powered topics tailored to your coding journey
      </p>

      {/* Suggestions List */}
      <div className="space-y-3">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className="group p-3 bg-secondary/40 border border-border/20 rounded-lg hover:border-accent/40 hover:bg-secondary/60 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0 pt-1">
                {suggestion.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm leading-snug group-hover:text-accent transition-colors">
                  {suggestion.title}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {suggestion.category}
                </p>
              </div>
              <Check className="w-4 h-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      <button className="w-full mt-6 py-2 bg-primary/20 border border-primary/30 text-primary rounded-lg font-semibold hover:bg-primary/30 hover:border-primary/50 transition-all text-sm">
        View All Topics
      </button>
    </div>
  )
}
