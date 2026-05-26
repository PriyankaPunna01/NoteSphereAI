'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Folder } from 'lucide-react'

const projects = [
  {
    id: 1,
    name: 'React Dashboard',
    description: 'Real-time analytics dashboard',
    progress: 65,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 2,
    name: 'API Gateway',
    description: 'Microservices authentication layer',
    progress: 42,
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 3,
    name: 'Mobile App',
    description: 'Cross-platform mobile experience',
    progress: 78,
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 4,
    name: 'Database Optimization',
    description: 'Query performance improvements',
    progress: 88,
    color: 'from-orange-500 to-red-500',
  },
]

export function PinnedProjectsCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0)

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById('projects-scroll')
    if (container) {
      const amount = 320
      const newPosition =
        direction === 'left'
          ? Math.max(0, scrollPosition - amount)
          : scrollPosition + amount
      setScrollPosition(newPosition)
      container.scrollTo({
        left: newPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="backdrop-blur-md bg-card/40 border border-border/20 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Folder className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold">Pinned Projects</h3>
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-secondary/60 border border-border/20 rounded-lg hover:bg-secondary hover:border-primary/30 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-secondary/60 border border-border/20 rounded-lg hover:bg-secondary hover:border-primary/30 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        id="projects-scroll"
        className="flex gap-4 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-secondary/30 [&::-webkit-scrollbar-thumb]:bg-primary/50 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex-shrink-0 w-80 backdrop-blur-md bg-secondary/40 border border-border/20 rounded-xl p-5 hover:border-primary/40 hover:bg-secondary/60 transition-all group cursor-pointer"
          >
            <div className={`w-full h-24 bg-gradient-to-r ${project.color} rounded-lg mb-4 opacity-80 group-hover:opacity-100 transition-opacity`} />

            <h4 className="font-semibold text-lg mb-1">{project.name}</h4>
            <p className="text-sm text-muted-foreground mb-4">
              {project.description}
            </p>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary font-semibold">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-secondary/60 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-accent h-full rounded-full transition-all"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
