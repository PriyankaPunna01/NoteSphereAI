'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Bell, Trash2 } from 'lucide-react'
import { useExitPrompt } from '@/hooks/useExitPrompt'
import { LocalNotifications } from '@capacitor/local-notifications'

type Reminder = {
  id: string
  title: string
  description: string | null
  reminder_at: string
  notified: boolean
}

export default function RemindersPage() {
  useExitPrompt()

  const supabase = createClient()

  const audioRef =
    useRef<HTMLAudioElement | null>(null)

  // FIX 3: use a ref to track alarm state (avoids stale closure in intervals)
  const isAlarmPlayingRef = useRef(false)

  const [title, setTitle] =
    useState('')

  const [description, setDescription] =
    useState('')

  const [reminderAt, setReminderAt] =
    useState('')

  const [reminders, setReminders] =
    useState<Reminder[]>([])

  const [loading, setLoading] =
    useState(false)

  const [isAlarmPlaying, setIsAlarmPlaying] =
    useState(false)

  const [currentReminder, setCurrentReminder] =
    useState<Reminder | null>(null)

  useEffect(() => {

    const audio = new Audio('/alarm.mp3')

    audio.loop = true
    audio.preload = 'auto'

    audio.oncanplaythrough = () => {
      console.log('Alarm loaded')
    }

    audio.onerror = (e) => {
      console.error('Alarm file error', e)
    }

    audioRef.current = audio

    LocalNotifications.requestPermissions()

  }, [])

  // FIX 2: unlock audio on first user interaction (required by browsers/mobile)
  useEffect(() => {
    const unlock = () => {
      if (audioRef.current) {
        audioRef.current.play().then(() => {
          audioRef.current!.pause()
          audioRef.current!.currentTime = 0
          console.log('Audio unlocked')
        }).catch(() => {})
      }
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('click', unlock)
    }
    window.addEventListener('touchstart', unlock)
    window.addEventListener('click', unlock)
    return () => {
      window.removeEventListener('touchstart', unlock)
      window.removeEventListener('click', unlock)
    }
  }, [])

  const fetchReminders = async () => {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', user.id)
      .order('reminder_at', {
        ascending: true,
      })

    if (error) {
      console.error(error)
      return
    }

    setReminders(data || [])
  }

  useEffect(() => {
    fetchReminders()
  }, [])

  // FIX 4: fetch every 30s instead of every 1s to avoid hammering Supabase
  useEffect(() => {

    const interval = setInterval(async () => {
      await fetchReminders()
    }, 30000)

    return () => clearInterval(interval)

  }, [])

  useEffect(() => {
    checkReminders()
  }, [reminders])

  // FIX 4: separate local check every 5s (no DB call)
  useEffect(() => {
    const interval = setInterval(() => {
      checkReminders()
    }, 5000)
    return () => clearInterval(interval)
  }, [reminders])

  const stopAlarm = async () => {

    if (audioRef.current) {

      audioRef.current.pause()

      audioRef.current.currentTime = 0
    }

    // FIX 3: update both state and ref
    setIsAlarmPlaying(false)
    isAlarmPlayingRef.current = false

    if (currentReminder) {

      await supabase
        .from('reminders')
        .update({
          notified: true,
        })
        .eq('id', currentReminder.id)
    }

    setCurrentReminder(null)

    fetchReminders()
  }

  const checkReminders = async () => {

    // FIX 3: use ref instead of state (avoids stale closure)
    if (isAlarmPlayingRef.current) return

    const now = new Date()

    for (const reminder of reminders) {

      const reminderTime = new Date(
        reminder.reminder_at
      )

      const diff =
        now.getTime() -
        reminderTime.getTime()

      // FIX 3: use ref instead of state
      if (
        !reminder.notified &&
        !isAlarmPlayingRef.current &&
        diff >= 0 &&
        diff <= 10000
      ) {

        setCurrentReminder(reminder)

        // FIX 3: update both state and ref
        setIsAlarmPlaying(true)
        isAlarmPlayingRef.current = true

        await supabase
          .from('reminders')
          .update({
            notified: true,
          })
          .eq('id', reminder.id)

        if (
          'Notification' in window &&
          Notification.permission ===
            'granted'
        ) {

          new Notification(
            '⏰ Reminder',
            {
              body: reminder.title,
            }
          )
        }

        if ('vibrate' in navigator) {

          navigator.vibrate([
            500,
            300,
            500,
            300,
            1000,
          ])
        }

        try {

          if (audioRef.current) {

            audioRef.current.currentTime = 0

            audioRef.current
              .play()
              .then(() => {
                console.log('Alarm started')
              })
              .catch((err) => {
                console.error(
                  'Audio blocked:',
                  err
                )

                alert(
                  'Audio playback blocked by Android'
                )
              })
          }

        } catch (error) {

          console.error(error)
        }
        break
      }
    }
  }

  const addReminder = async () => {

    if (!title.trim() || !reminderAt) {

      alert(
        'Please enter title and date/time.'
      )

      return
    }

    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('reminders')
      .insert({
        title,
        description,
        reminder_at: reminderAt,
        notified: false,
        user_id: user.id,
      })

    if (error) {

      console.error(error)

      alert(
        'Failed to add reminder.'
      )

    } else {

      await LocalNotifications.schedule({
        notifications: [
          {
            id: Date.now(),
            title: title,
            body: description || 'Reminder',
            schedule: {
              at: new Date(reminderAt),
            },
          },
        ],
      })

      setTitle('')
      setDescription('')
      setReminderAt('')

      fetchReminders()
    }

    setLoading(false)
  }

  const deleteReminder = async (
    id: string
  ) => {

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)

    if (!error) {
      fetchReminders()
    }
  }

  return (

    <div className="w-full max-w-md mx-auto px-4 py-5">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">

        <Bell className="w-8 h-8 text-primary" />

        <h1 className="text-4xl font-bold">
          Reminders
        </h1>

      </div>

      {/* ALARM BANNER */}
      {isAlarmPlaying &&
        currentReminder && (

        <div
          className="
            mb-6
            rounded-3xl
            border
            border-red-300
            bg-red-50
            p-4
          "
        >

          <h2 className="font-semibold text-red-700">
            🔔 Reminder Alarm
          </h2>

          <p className="text-red-600 mt-1">
            {currentReminder.title}
          </p>

          <Button
            onClick={stopAlarm}
            variant="destructive"
            className="w-full mt-4 rounded-2xl"
          >
            Stop Alarm
          </Button>

        </div>

      )}

      {/* FORM */}
      <div
        className="
          bg-white
          rounded-3xl
          border
          p-5
          shadow-sm
          mb-6
          space-y-4
        "
      >

        <input
          type="text"
          placeholder="Reminder title"
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
          "
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) =>
            setDescription(
              e.target.value
            )
          }
          className="
            w-full
            border
            rounded-2xl
            px-4
            py-4
            min-h-[120px]
          "
        />

        <div className="w-full border rounded-2xl px-4 py-3 bg-white overflow-hidden">
          <label className="text-xs text-muted-foreground mb-1 block">
            Date & Time
          </label>
          <input
            type="datetime-local"
            value={reminderAt}
            onChange={(e) =>
              setReminderAt(e.target.value)
            }
            className="w-full max-w-full bg-white text-black text-sm focus:outline-none"
            style={{
              colorScheme: 'light',
              maxWidth: '100%',
            }}
          />
        </div>

        <Button
          onClick={addReminder}
          disabled={loading}
          className="
            w-full
            rounded-2xl
            py-6
            text-base
            font-semibold
          "
        >

          {loading
            ? 'Adding...'
            : 'Add Reminder'}

        </Button>

      </div>

      {/* REMINDERS */}
      <div className="space-y-4">

        {reminders.length === 0 ? (

          <div
            className="
              text-center
              text-muted-foreground
              py-10
            "
          >
            No reminders yet.
          </div>

        ) : (

          reminders.map(
            (reminder) => (

              <div
                key={reminder.id}
                className="
                  bg-white
                  rounded-3xl
                  border
                  p-5
                  shadow-sm
                "
              >

                <div className="flex justify-between items-start gap-4">

                  <div>

                    <h2 className="font-bold text-2xl">
                      {reminder.title}
                    </h2>

                    {reminder.description && (

                      <p className="text-muted-foreground mt-3">
                        {reminder.description}
                      </p>

                    )}

                    <p className="text-primary mt-4">
                      {new Date(
                        reminder.reminder_at
                      ).toLocaleString()}
                    </p>

                    {/* FIX 1: show correct status — Pending / Missed / Already notified */}
                    <p className="text-sm text-muted-foreground mt-2">
                      {reminder.notified
                        ? 'Already notified'
                        : new Date(reminder.reminder_at) < new Date()
                        ? 'Missed'
                        : 'Pending'}
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      deleteReminder(
                        reminder.id
                      )
                    }
                    className="text-red-500"
                  >

                    <Trash2 className="w-6 h-6" />

                  </button>

                </div>

              </div>

            )
          )

        )}

      </div>

    </div>

  )
}
