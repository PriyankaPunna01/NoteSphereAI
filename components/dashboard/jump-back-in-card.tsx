'use client'

import { ArrowRight, Code2 } from 'lucide-react'

export function JumpBackInCard() {
  return (
    <div className="group backdrop-blur-md bg-card/40 border border-border/20 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-primary/20 rounded-lg">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">Jump Back In</h3>
        </div>

        {/* Code Snippet */}
        <div className="bg-secondary/50 border border-border/20 rounded-lg p-4 font-mono text-sm text-muted-foreground overflow-hidden">
          <div className="text-primary">public class</div>
          <div className="text-accent">DataProcessor</div>
          <div className="text-muted-foreground">
            {'{'}
            <div className="ml-4">
              <div className="text-primary">private</div>
              <div className="text-muted-foreground">
                static List{'{'}
                <span className="text-primary">Integer</span>
                {'}'} data = new ArrayList{'{'}
                <span className="text-primary">Integer</span>
                {'}'}();
              </div>
            </div>
            {'}'}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          Continue working on your data processing algorithm
        </p>
      </div>

      <button className="mt-6 flex items-center gap-2 text-primary font-semibold group-hover:gap-3 transition-all">
        Continue Editing
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}
