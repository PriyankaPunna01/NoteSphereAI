'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { CheckSquare, Trash2 } from 'lucide-react'
import { useExitPrompt } from '@/hooks/useExitPrompt'

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

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error(error)
      return
    }

    setTasks(data || [])
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const addTask = async () => {

    if (!title.trim()) return

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('tasks')
      .insert({
        title,
        completed: false,
        user_id: user.id,
      })

    if (error) {
      console.error(error)
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

  const deleteTask = async (
    id: string
  ) => {

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchTasks()
    }
  }

  return (

    <div className="w-full max-w-md mx-auto px-4 py-5">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">

        <CheckSquare className="w-8 h-8 text-primary" />

        <h1 className="text-4xl font-bold tracking-tight">
          Tasks
        </h1>

      </div>

      {/* ADD TASK */}
      <div
        className="
          bg-white
          rounded-3xl
          border
          p-4
          shadow-sm
          mb-6
        "
      >

        <div className="flex flex-col gap-3">

          <input
            type="text"
            placeholder="Enter task..."
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
            className="
              w-full
              border
              rounded-2xl
              px-4
              py-4
              text-base
              focus:outline-none
            "
          />

          <Button
            onClick={addTask}
            className="
              w-full
              rounded-2xl
              py-6
              text-base
              font-semibold
            "
          >
            Add Task
          </Button>

        </div>

      </div>

      {/* TASK LIST */}
      <div className="space-y-4">

        {tasks.length === 0 ? (

          <div
            className="
              text-center
              text-muted-foreground
              py-10
            "
          >
            No tasks yet.
          </div>

        ) : (

          tasks.map((task) => (

            <div
              key={task.id}
              className="
                bg-white
                rounded-3xl
                border
                p-5
                shadow-sm
                flex
                items-center
                justify-between
              "
            >

              <label className="flex items-center gap-4 flex-1">

                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() =>
                    toggleTask(task)
                  }
                  className="w-5 h-5"
                />

                <span
                  className={`text-lg ${
                    task.completed
                      ? 'line-through text-muted-foreground'
                      : ''
                  }`}
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

                <Trash2 className="w-6 h-6" />

              </button>

            </div>

          ))

        )}

      </div>

    </div>

  )
}