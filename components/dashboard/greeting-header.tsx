import { Cloud, CloudRain, Sun } from 'lucide-react'

export function GreetingHeader() {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening'

  return (
    <div className="backdrop-blur-md bg-card/40 border border-border/20 rounded-2xl p-8 shadow-xl">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {greeting}, Developer
          </h1>
          <p className="text-muted-foreground text-lg">
            Ready to make today productive? Let&apos;s dive in.
          </p>
        </div>

        {/* Weather & Productivity Widget */}
        <div className="flex gap-4">
          <div className="backdrop-blur-md bg-secondary/40 border border-border/20 rounded-xl p-4 text-center min-w-max">
            <Sun className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
            <p className="text-sm font-semibold">72°F</p>
            <p className="text-xs text-muted-foreground">Sunny</p>
          </div>

          <div className="backdrop-blur-md bg-secondary/40 border border-border/20 rounded-xl p-4 text-center min-w-max">
            <p className="text-sm font-semibold mb-1">Productivity</p>
            <p className="text-2xl font-bold text-accent">87%</p>
            <p className="text-xs text-muted-foreground">This week</p>
          </div>
        </div>
      </div>
    </div>
  )
}
