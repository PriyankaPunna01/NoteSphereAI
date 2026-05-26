// app/dashboard/reminders/page.tsx
// Updated version based on your uploaded file: :contentReference[oaicite:0]{index=0}

'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Bell, Trash2 } from 'lucide-react'

type Reminder = {
  id: string
  title: string
  description: string | null
  reminder_at: string
  notified: boolean
}

export default function RemindersPage() {
  const supabase = createClient()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [reminderAt, setReminderAt] = useState('')
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(false)
  const [isAlarmPlaying, setIsAlarmPlaying] =
    useState(false)
  const [currentReminder, setCurrentReminder] =
    useState<Reminder | null>(null)

  // Initialize alarm audio and request notification permission
  useEffect(() => {
    const audio = new Audio('/alarm.mp3')
    audio.loop = true
    audio.preload = 'auto'
    audioRef.current = audio

    if ('Notification' in window) {
      Notification.requestPermission()
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  // Fetch reminders
  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .order('reminder_at', { ascending: true })

    if (error) {
      console.error(
        'Error fetching reminders:',
        error
      )
      return
    }

    setReminders(data || [])
  }

  useEffect(() => {
    fetchReminders()
  }, [])

  // Check reminders every second
  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders()
    }, 1000)

    return () => clearInterval(interval)
  }, [reminders, isAlarmPlaying])

  // Stop alarm
  const stopAlarm = async () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    setIsAlarmPlaying(false)

    // Mark the current reminder as notified
    if (currentReminder) {
      await supabase
        .from('reminders')
        .update({ notified: true })
        .eq('id', currentReminder.id)
    }

    setCurrentReminder(null)
    fetchReminders()
  }

  // Check reminders
  const checkReminders = async () => {
    // Prevent multiple alarms from playing
    if (isAlarmPlaying) return

    const now = new Date()

    for (const reminder of reminders) {
      const reminderTime = new Date(
        reminder.reminder_at
      )

      if (
        !reminder.notified &&
        reminderTime <= now
      ) {
        setCurrentReminder(reminder)
        setIsAlarmPlaying(true)

        // Browser notification
        if (
          'Notification' in window &&
          Notification.permission ===
            'granted'
        ) {
          new Notification('⏰ Reminder', {
            body: reminder.title,
          })
        }

        // Play alarm
        try {
          if (audioRef.current) {
            audioRef.current.currentTime = 0
            await audioRef.current.play()
          }
        } catch (err) {
          console.error(
            'Audio play error:',
            err
          )
          alert(
            'Unable to play alarm sound. Please make sure public/alarm.mp3 exists.'
          )
        }

        break
      }
    }
  }

  // Add reminder
  const addReminder = async () => {
    if (!title.trim() || !reminderAt) {
      alert(
        'Please enter title and reminder date/time.'
      )
      return
    }

    setLoading(true)

    const { error } = await supabase
      .from('reminders')
      .insert({
        title,
        description,
        reminder_at: reminderAt,
        notified: false,
      })

    if (error) {
      console.error(
        'Error adding reminder:',
        error
      )
      alert('Failed to add reminder.')
    } else {
      setTitle('')
      setDescription('')
      setReminderAt('')
      fetchReminders()
    }

    setLoading(false)
  }

  // Delete reminder
  const deleteReminder = async (id: string) => {
    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(
        'Error deleting reminder:',
        error
      )
      alert('Failed to delete reminder.')
    } else {
      fetchReminders()
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-7 h-7 text-primary" />
        <h1 className="text-3xl font-bold">
          Reminders
        </h1>
      </div>

      {/* Stop Alarm Banner */}
      {isAlarmPlaying && currentReminder && (
        <div className="mb-6 border border-red-300 bg-red-50 rounded-xl p-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-red-700">
              🔔 Reminder Alarm is Playing
            </h2>
            <p className="text-sm text-red-600">
              {currentReminder.title}
            </p>
          </div>

          <Button
            onClick={stopAlarm}
            variant="destructive"
          >
            Stop Alarm
          </Button>
        </div>
      )}

      {/* Add Reminder Form */}
      <div className="border rounded-xl p-6 bg-card mb-8 space-y-4">
        <input
          type="text"
          placeholder="Reminder title"
          value={title}
          onChange={(e) =>
            setTitle(e.target.value)
          }
          className="w-full border rounded-lg px-3 py-2"
        />

        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
          className="w-full border rounded-lg px-3 py-2 min-h-[100px]"
        />

        <input
          type="datetime-local"
          value={reminderAt}
          onChange={(e) =>
            setReminderAt(e.target.value)
          }
          className="w-full border rounded-lg px-3 py-2"
        />

        <Button
          onClick={addReminder}
          disabled={loading}
        >
          {loading
            ? 'Adding...'
            : 'Add Reminder'}
        </Button>
      </div>

      {/* Reminder List */}
      <div className="space-y-4">
        {reminders.length === 0 ? (
          <p className="text-muted-foreground">
            No reminders yet.
          </p>
        ) : (
          reminders.map((reminder) => (
            <div
              key={reminder.id}
              className="border rounded-xl p-5 bg-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-lg">
                    {reminder.title}
                  </h2>

                  {reminder.description && (
                    <p className="text-muted-foreground mt-2">
                      {reminder.description}
                    </p>
                  )}

                  <p className="text-sm text-primary mt-3">
                    {new Date(
                      reminder.reminder_at
                    ).toLocaleString()}
                  </p>

                  <p className="text-xs mt-2 text-muted-foreground">
                    {reminder.notified
                      ? 'Already notified'
                      : 'Pending'}
                  </p>
                </div>

                <button
                  onClick={() =>
                    deleteReminder(reminder.id)
                  }
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}