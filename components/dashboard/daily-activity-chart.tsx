'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

const data = [
  { day: 'Mon', notes: 12, snippets: 8 },
  { day: 'Tue', notes: 19, snippets: 12 },
  { day: 'Wed', notes: 15, snippets: 10 },
  { day: 'Thu', notes: 25, snippets: 18 },
  { day: 'Fri', notes: 22, snippets: 15 },
  { day: 'Sat', notes: 18, snippets: 14 },
  { day: 'Sun', notes: 28, snippets: 21 },
]

export function DailyActivityChart() {
  return (
    <div className="backdrop-blur-md bg-card/40 border border-border/20 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-lg font-semibold">Daily Activity</h3>
        </div>
        <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-semibold">
          +12% vs last week
        </span>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="noteGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(133, 109, 249)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="rgb(133, 109, 249)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(59, 130, 246, 0.1)"
            vertical={false}
          />
          <XAxis dataKey="day" stroke="rgb(156, 163, 175)" />
          <YAxis stroke="rgb(156, 163, 175)" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgb(30, 41, 59)',
              border: '1px solid rgb(71, 85, 105)',
              borderRadius: '8px',
            }}
            labelStyle={{ color: 'rgb(226, 232, 240)' }}
            cursor={{ stroke: 'rgb(133, 109, 249)', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="notes"
            stroke="rgb(133, 109, 249)"
            strokeWidth={3}
            dot={{ fill: 'rgb(133, 109, 249)', r: 5 }}
            activeDot={{ r: 7 }}
            name="Notes Created"
          />
          <Line
            type="monotone"
            dataKey="snippets"
            stroke="rgb(34, 197, 94)"
            strokeWidth={3}
            dot={{ fill: 'rgb(34, 197, 94)', r: 5 }}
            activeDot={{ r: 7 }}
            name="Code Snippets"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
