'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckSquare, Trash2 } from 'lucide-react'

type Task = {
  id: string
  title: string
  completed: boolean
}

export default function TasksPage() {
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [tasks, setTasks] = useState<Task[]>([])

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error('Error fetching tasks:', error)
      return
    }

    setTasks(data || [])
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const addTask = async () => {
    if (!title.trim()) return

    const { error } = await supabase
      .from('tasks')
      .insert({
        title,
        completed: false,
      })

    if (error) {
      console.error('Error adding task:', error)
      alert('Failed to add task.')
    } else {
      setTitle('')
      fetchTasks()
    }
  }

  const toggleTask = async (
    task: Task
  ) => {
    const { error } = await supabase
      .from('tasks')
      .update({
        completed: !task.completed,
      })
      .eq('id', task.id)

    if (!error) {
      fetchTasks()
    }
  }

  const deleteTask = async (id: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchTasks()
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CheckSquare className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>

      {/* Add Task */}
      <div className="border rounded-xl p-6 bg-card mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Enter task..."
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="flex-1 border rounded-lg px-3 py-2"
          />

          <Button onClick={addTask}>
            Add Task
          </Button>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-muted-foreground">
            No tasks yet.
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-xl p-4 bg-card flex items-center justify-between"
            >
              <label className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() =>
                    toggleTask(task)
                  }
                />

                <span
                  className={
                    task.completed
                      ? 'line-through text-muted-foreground'
                      : ''
                  }
                >
                  {task.title}
                </span>
              </label>

              <button
                onClick={() =>
                  deleteTask(task.id)
                }
                className="text-red-500"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}