'use client'


import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useExitPrompt } from '@/hooks/useExitPrompt'

import { createClient } from '@/lib/supabase/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  ArrowLeft,
  Save,
  Palette,
  Mic,
  Square,
  ChevronDown,
  Bot,
  PenLine,
} from 'lucide-react'

type Note = {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
  theme: string
  note_type?: string
  audio_urls?: string[]
  image_urls?: string[]
  image_captions?: string[]
  voice_transcript?: string
  ai_summary?: string
  category?: string
}

const themes = [
  'Light',
  'Dark',
  'Ocean Blue',
  'Nature Green',
  'Pink Blossom',
  'Purple Night',
  'Sunset Orange',
  'Animal Lovers',
]

const noteTypes = [
  'Text Note',
  'Voice Note',
  'Image Note',
  'Mixed Note',
]

export default function NoteEditorPage() {

  const params = useParams()
  const router = useRouter()
    useExitPrompt() // 👈 ADD THIS LINE


  const noteId = params.id as string

  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [textAlign, setTextAlign] = useState('left')

  const [theme, setTheme] =
    useState('Light')

  const [noteType, setNoteType] =
    useState('Text Note')

  const [audioUrls, setAudioUrls] =
    useState<string[]>([])

  const [imageUrls, setImageUrls] =
    useState<string[]>([])

  const [imageCaptions, setImageCaptions] =
    useState<string[]>([])

  const [voiceTranscript, setVoiceTranscript] =
    useState('')

  const [aiSummary, setAiSummary] =
    useState('')

  const [category, setCategory] =
    useState('')

  const [isAnalyzing, setIsAnalyzing] =
    useState(false)

  const [isParaphrasing, setIsParaphrasing] =
    useState(false)

  const [isRecording, setIsRecording] =
    useState(false)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSaving, setIsSaving] =
    useState(false)

  const mediaRecorderRef =
    useRef<MediaRecorder | null>(null)

  const audioChunksRef =
    useRef<Blob[]>([])

  const recognitionRef =
    useRef<any>(null)

  const titleRef =
    useRef<HTMLDivElement>(null)

  const contentRef =
    useRef<HTMLDivElement>(null)

  useEffect(() => {

    async function loadNote() {

      try {

        const {
          data,
          error,
        } = await supabase
          .from('notes')
          .select('*')
          .eq('id', noteId)
          .single()

        if (error) throw error

        setTitle(data.title || '')
        setContent(data.content || '')

        if (titleRef.current)
          titleRef.current.innerText =
            data.title || ''

        if (contentRef.current)
          contentRef.current.innerText =
            data.content || ''
        setTheme(data.theme || 'Light')

        setNoteType(
          data.note_type || 'Text Note'
        )

        setAudioUrls(
          data.audio_urls || []
        )

        setImageUrls(
          data.image_urls || []
        )

        setImageCaptions(
          data.image_captions ||
          new Array(
            (data.image_urls || []).length
          ).fill('')
        )

        setVoiceTranscript(
          data.voice_transcript || ''
        )

        setAiSummary(
          data.ai_summary || ''
        )

        setCategory(
          data.category || ''
        )

      } catch (error) {

        console.error(
          'Error loading note:',
          error
        )

        router.push('/dashboard')

      } finally {

        setIsLoading(false)

      }
    }

    loadNote()

  }, [noteId, router, supabase])

  useEffect(() => {

    if (typeof window === 'undefined')
      return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition)
      return

    const recognition =
      new SpeechRecognition()

    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult =
      (event: any) => {

        let transcript = ''

        for (
          let i = 0;
          i < event.results.length;
          i++
        ) {

          transcript +=
            event.results[i][0]
              .transcript + ' '
        }

        setVoiceTranscript(
          transcript.trim()
        )
      }

    recognitionRef.current =
      recognition

  }, [])
  useEffect(() => {
  if (isLoading) return   // ← add this guard
  if (titleRef.current)
    titleRef.current.innerText = title
  if (contentRef.current)
    contentRef.current.innerText = content
}, [noteType, isLoading])

  const getThemeClass = () => {

    switch (theme) {

      case 'Dark':
        return 'bg-slate-950 text-white border border-slate-800 rounded-3xl'

      case 'Ocean Blue':
        return 'bg-gradient-to-br from-blue-100 to-cyan-200 text-slate-900 border border-blue-300 rounded-3xl'

      case 'Nature Green':
        return 'bg-gradient-to-br from-green-100 to-emerald-200 text-slate-900 border border-green-300 rounded-3xl'

      case 'Pink Blossom':
        return 'bg-gradient-to-br from-pink-100 to-rose-200 text-slate-900 border border-pink-300 rounded-3xl'

      case 'Purple Night':
        return 'bg-gradient-to-br from-purple-900 to-indigo-950 text-white border border-purple-700 rounded-3xl'

      case 'Sunset Orange':
        return 'bg-gradient-to-br from-orange-100 to-red-200 text-slate-900 border border-orange-300 rounded-3xl'

      case 'Animal Lovers':
        return 'bg-gradient-to-br from-amber-100 to-yellow-200 text-slate-900 border border-amber-300 rounded-3xl'

      default:
        return 'bg-white text-slate-900 border border-gray-200 rounded-3xl'
    }
  }

  const handleAnalyzeNote = async () => {

    const fullContent = [
      title,
      content,
      voiceTranscript,
      imageCaptions.join('\n'),
    ]
      .filter(Boolean)
      .join('\n\n')

    if (!fullContent.trim()) {
      alert(
        'No content available to analyze.'
      )
      return
    }

    setIsAnalyzing(true)

    try {

      const res = await fetch(
        '/api/analyze-note',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            content: fullContent,
          }),
        }
      )

      const data =
        await res.json()

      if (!res.ok)
        throw new Error(
          data.error ||
            'AI analysis failed.'
        )

      setAiSummary(
        data.summary || ''
      )

      setCategory(
        data.category || ''
      )

      await supabase
        .from('notes')
        .update({
          ai_summary:
            data.summary || '',
          category:
            data.category || '',
        })
        .eq('id', noteId)

    } catch (error) {

      console.error(error)

      alert(
        'Failed to analyze note.'
      )

    } finally {

      setIsAnalyzing(false)

    }
  }

  const handleParaphrase = async () => {

  const currentContent =
    contentRef.current?.innerText?.trim() ||
    content.trim() ||
    contentRef.current?.textContent?.trim() || ''

  console.log('ref innerText:', contentRef.current?.innerText)
  console.log('content state:', content)

  if (!currentContent) {
    alert(
      'No content available to paraphrase.'
    )
    return
  }

  setIsParaphrasing(true)

  try {

    const res = await fetch(
      '/api/paraphrase-note',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json',
        },
        body: JSON.stringify({
          content: currentContent,
        }),
      }
    )

    const data = await res.json()

    if (!res.ok) {
      throw new Error(
        data.error ||
        'Failed to paraphrase.'
      )
    }

    const paraphrased =
      data.paraphrased || ''

    setContent(paraphrased)

    if (contentRef.current) {
      contentRef.current.innerText =
        paraphrased
    }

  } catch (error) {

    console.error(
      'Paraphrase error:',
      error
    )

    alert(
      'Failed to paraphrase note.'
    )

  } finally {

    setIsParaphrasing(false)

  }
}
  const handleSave = async () => {

    setIsSaving(true)

    try {

      const { error } =
        await supabase
          .from('notes')
          .update({
            title,
            content,
            theme,
            note_type: noteType,
            audio_urls: audioUrls,
            image_urls: imageUrls.filter(
              (url) =>
                !url.startsWith(
                  'blob:'
                )
            ),
            image_captions:
              imageCaptions,
            voice_transcript:
              voiceTranscript,
            ai_summary: aiSummary,
            category,
            updated_at:
              new Date().toISOString(),
          })
          .eq('id', noteId)

      if (error) throw error

      router.push('/dashboard')

    } catch (error) {

      console.error(error)

      alert('Failed to save.')

    } finally {

      setIsSaving(false)

    }
  }
  const handleRemoveSummary = async () => {

  try {

    const { error } = await supabase
      .from('notes')
      .update({
        ai_summary: null,
      })
      .eq('id', noteId)

    if (error) throw error

    setAiSummary('')

  } catch (error) {

    console.error(
      'Error removing summary:',
      error
    )

    alert(
      'Failed to remove summary.'
    )
  }
}
  const startRecording = async () => {

  try {

    // CHECK MICROPHONE PERMISSION
    const permission =
      await navigator.permissions.query({
        name: 'microphone' as PermissionName,
      })

    if (permission.state === 'denied') {

      alert(
        'Microphone permission is blocked. Please enable it from browser/app settings.'
      )

      return
    }

    // REQUEST MICROPHONE ACCESS
    const stream =
      await navigator
        .mediaDevices
        .getUserMedia({
          audio: true,
        })

    // CREATE MEDIA RECORDER
    const mediaRecorder =
      new MediaRecorder(stream)

    mediaRecorderRef.current =
      mediaRecorder

    // RESET AUDIO CHUNKS
    audioChunksRef.current = []

    // STORE AUDIO DATA
    mediaRecorder.ondataavailable =
      (event) => {

        if (
          event.data.size > 0
        ) {

          audioChunksRef.current.push(
            event.data
          )
        }
      }

    // WHEN RECORDING STOPS
    mediaRecorder.onstop =
      async () => {

        try {

          // CREATE AUDIO FILE
          const audioBlob =
            new Blob(
              audioChunksRef.current,
              {
                type:
                  'audio/webm',
              }
            )

          // FILE NAME
          const fileName =
            `${noteId}-${Date.now()}.webm`

          // UPLOAD TO SUPABASE
          const {
            error: uploadError,
          } = await supabase
            .storage
            .from(
              'voice-notes'
            )
            .upload(
              fileName,
              audioBlob,
              {
                contentType:
                  'audio/webm',
              }
            )

          if (uploadError)
            throw uploadError

          // GET PUBLIC URL
          const { data } =
            supabase
              .storage
              .from(
                'voice-notes'
              )
              .getPublicUrl(
                fileName
              )

          // SAVE AUDIO URL
          setAudioUrls(
            (prev) => [
              ...prev,
              data.publicUrl,
            ]
          )

        } catch (error) {

          console.error(
            'Audio upload error:',
            error
          )

          alert(
            'Failed to upload voice note.'
          )
        }
      }

    // START RECORDING
    mediaRecorder.start()

    // START SPEECH RECOGNITION
    recognitionRef.current?.start()

    // UPDATE STATE
    setIsRecording(true)

  } catch (error) {

    console.error(
      'Microphone error:',
      error
    )

    alert(
      'Please allow microphone permission in your phone settings.'
    )
  }
}

  const stopRecording = () => {

    mediaRecorderRef.current?.stop()

    recognitionRef.current?.stop()

    setIsRecording(false)
  }

  const handleImageUpload =
    async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {

      const file =
        event.target.files?.[0]

      if (!file) return

      const previewUrl =
        URL.createObjectURL(file)

      setImageUrls((prev) => [
        ...prev,
        previewUrl,
      ])

      setImageCaptions((prev) => [
        ...prev,
        '',
      ])

      try {

        const fileExt =
          file.name
            .split('.')
            .pop()

        const fileName =
          `${noteId}-${Date.now()}.${fileExt}`

        const {
          error: uploadError,
        } = await supabase
          .storage
          .from(
            'image_bucket'
          )
          .upload(
            fileName,
            file
          )

        if (uploadError)
          throw uploadError

        const { data } =
          supabase.storage
            .from(
              'image_bucket'
            )
            .getPublicUrl(
              fileName
            )

        setImageUrls((prev) => {

          const updated = [
            ...prev,
          ]

          updated[
            updated.length - 1
          ] = data.publicUrl

          return updated
        })

      } catch (error) {

        console.error(error)

        alert(
          'Failed to upload image.'
        )
      }
    }

  const updateImageCaption = (
    index: number,
    value: string
  ) => {

    const updated = [
      ...imageCaptions,
    ]

    updated[index] = value

    setImageCaptions(updated)
  }

  const removeImage = (
    indexToRemove: number
  ) => {

    setImageUrls((prev) =>
      prev.filter(
        (_, index) =>
          index !==
          indexToRemove
      )
    )

    setImageCaptions((prev) =>
      prev.filter(
        (_, index) =>
          index !==
          indexToRemove
      )
    )
  }

  const alignOptions = [
    {
      value: 'left',
      label: '⬅ Left',
    },
    {
      value: 'center',
      label: '↔ Center',
    },
    {
      value: 'right',
      label: '➡ Right',
    },
    {
      value: 'justify',
      label: '☰ Justify',
    },
  ]

  if (isLoading) {

    return (
      <div className="  p-3
  sm:p-4
  md:p-6">
        Loading...
      </div>
    )
  }

  return (

    <div className="w-full overflow-x-hidden px-3 sm:px-6 py-4">

      {/* TOOLBAR */}
      <div className="flex flex-wrap
  items-center
  gap-2">

        <button
          onClick={() => {
  const confirmExit = window.confirm("Are you sure you want to go back?");
  if (confirmExit) router.push('/dashboard');
}}
          className="flex items-center gap-1.5 text-sm font-medium"
        >

          <ArrowLeft className="w-4 h-4" />

          Back

        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* THEME */}
        <div className="relative flex items-center">

          <Palette className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />

          <select
            value={theme}
            onChange={(e) =>
              setTheme(
                e.target.value
              )
            }
            className="appearance-none pl-7 pr-6 py-1.5 text-xs font-medium bg-secondary border border-border rounded-full"
          >

            {themes.map((t) => (
              <option
                key={t}
                value={t}
              >
                {t}
              </option>
            ))}

          </select>

          <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none" />

        </div>

        {/* ALIGN */}
        <div className="relative flex items-center">

          <select
            value={textAlign}
            onChange={(e) =>
              setTextAlign(
                e.target.value
              )
            }
            className="appearance-none pl-3 pr-6 py-1.5 text-xs font-medium bg-secondary border border-border rounded-full"
          >

            {alignOptions.map(
              (o) => (
                <option
                  key={o.value}
                  value={o.value}
                >
                  {o.label}
                </option>
              )
            )}

          </select>

          <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none" />

        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 sm:ml-auto">

          <button
            onClick={
              handleAnalyzeNote
            }
            disabled={
              isAnalyzing
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-full"
          >

            <Bot className="w-3.5 h-3.5" />

            {isAnalyzing
              ? 'Analyzing…'
              : 'AI'}

          </button>

          <button
            onClick={
              handleParaphrase
            }
            disabled={
              isParaphrasing
            }
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-full"
          >

            <PenLine className="w-3.5 h-3.5" />

            {isParaphrasing
              ? 'Rewriting…'
              : 'Rewrite'}

          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded-full"
          >

            <Save className="w-3.5 h-3.5" />

            {isSaving
              ? 'Saving…'
              : 'Save'}

          </button>

        </div>

      </div>

      {/* NOTE CONTAINER */}
      <div
        className={`
          w-full
          max-w-full
          sm:max-w-5xl
          mx-auto
          p-4
          sm:p-8
          transition-all
          duration-500
          overflow-hidden
          ${getThemeClass()}
        `}
      >

        {/* NOTE TYPE */}
        <div className="mb-6">

          <div className="relative inline-flex items-center">

            <select
              value={noteType}
              onChange={(e) =>
                setNoteType(
                  e.target.value
                )
              }
              className="appearance-none pl-3 pr-7 py-1.5 text-xs font-medium bg-white/80 border border-border rounded-full"
            >

              {noteTypes.map(
                (type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {type}
                  </option>
                )
              )}

            </select>

            <ChevronDown className="w-3 h-3 absolute right-2 pointer-events-none" />

          </div>

        </div>

        {/* TEXT NOTES */}
        {(noteType === 'Text Note' || noteType === 'Mixed Note') && (
  <>
    {/* TITLE */}
    <div
      ref={titleRef}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => setTitle(e.currentTarget.innerText)}
      className="w-full text-2xl font-bold bg-transparent focus:outline-none mb-2 whitespace-pre-wrap break-words"
      data-placeholder="Note title..."
    />

    <div className="border-t border-border/40 mb-2" />

    {/* CONTENT */}
    <div
      ref={contentRef}
      contentEditable
      suppressContentEditableWarning
      onInput={(e) => setContent(e.currentTarget.innerText)}
      style={{ textAlign: textAlign as any }}
      className="w-full min-h-[250px] sm:min-h-[500px] mt-6 bg-transparent text-base sm:text-lg text-current focus:outline-none whitespace-pre-wrap break-words"
    />
  </>
)}


        {/* IMAGE NOTES */}
        {(noteType ===
          'Image Note' ||
          noteType ===
            'Mixed Note') && (
          <div className="mt-8 border rounded-2xl p-4 bg-white/70 w-full overflow-hidden">

            <div className="flex items-center justify-between mb-5">

              <h3 className="font-semibold text-lg">
                🖼 Image Notes
              </h3>

              <label
                className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium cursor-pointer"
              >

                Add Image

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageUpload
                  }
                  className="hidden"
                />

              </label>

            </div>

            {imageUrls.length ===
              0 && (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center text-gray-500 bg-white/50">
                No images added yet
              </div>
            )}

            <div className="space-y-5">

              {imageUrls.map(
                (
                  url,
                  index
                ) => (

                  <div
                    key={index}
                    className="bg-white rounded-2xl overflow-hidden border shadow-sm p-4 w-full max-w-[500px] mx-auto"
                  >

                    <div className="relative w-full h-[240px] rounded-2xl overflow-hidden bg-gray-100">

                      <Image
                        src={url}
                        alt={`Uploaded ${index}`}
                        fill
                        className="w-full h-full object-cover"
                        unoptimized
                      />

                    </div>

                    <div className="mt-4">

                      <textarea
                        value={
                          imageCaptions[
                            index
                          ] || ''
                        }
                        onChange={(
                          e
                        ) =>
                          updateImageCaption(
                            index,
                            e
                              .target
                              .value
                          )
                        }
                        placeholder="Add image caption..."
                        className="w-full border rounded-xl p-3 text-sm resize-none min-h-[90px] focus:outline-none"
                      />

                      <div className="flex justify-end mt-4">

                        <button
                          onClick={() =>
                            removeImage(
                              index
                            )
                          }
                          className="px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-medium"
                        >
                          Remove Image
                        </button>

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>
        )}

        {/* VOICE NOTES */}
        {(noteType ===
          'Voice Note' ||
          noteType ===
            'Mixed Note') && (
          <div className="mb-6 border rounded-xl p-4 bg-white/70 w-full overflow-hidden mt-8">

            <h3 className="font-semibold mb-4 text-lg">
              🎤 Voice Notes
            </h3>

            {!isRecording ? (
              <Button
                onClick={
                  startRecording
                }
              >
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                onClick={
                  stopRecording
                }
                variant="destructive"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}

            <div className="space-y-4 mt-4">

              {audioUrls.map(
                (
                  url,
                  index
                ) => (
                  <audio
                    key={index}
                    controls
                    src={url}
                    className="w-full"
                  />
                )
              )}

            </div>

            {voiceTranscript && (
              <div className="mt-6">

                <h4 className="font-semibold mb-2">
                  📝 Voice Transcript
                </h4>

                <textarea
                  value={
                    voiceTranscript
                  }
                  onChange={(e) =>
                    setVoiceTranscript(
                      e.target.value
                    )
                  }
                  className="w-full min-h-[120px] p-3 border rounded-lg"
                />

              </div>
            )}

          </div>
        )}

        {/* AI SUMMARY */}
{aiSummary && (
  <div className="mt-8 p-4 rounded-2xl border border-border bg-white/20 backdrop-blur-sm">

    {/* HEADER */}
    <div
      className="
        flex
        flex-col
        sm:flex-row
        sm:items-center
        sm:justify-between
        gap-3
        mb-4
      "
    >

      {/* LEFT */}
      <div className="flex items-center gap-2 flex-wrap">

        <Bot className="w-4 h-4" />

        <h4
          className="
            text-xs
            sm:text-sm
            font-semibold
            uppercase
            tracking-wide
          "
        >
          AI Summary
        </h4>

      </div>

      {/* RIGHT */}
      <div
        className="
          flex
          items-center
          gap-2
          flex-wrap
        "
      >

        {category && (
          <span
            className="
              text-[10px]
              sm:text-xs
              px-3
              py-1
              rounded-full
              bg-white/40
              backdrop-blur-sm
              border
              whitespace-nowrap
            "
          >
            {category}
          </span>
        )}

        <button
          onClick={handleRemoveSummary}
          className="
            px-3
            py-1
            text-[10px]
            sm:text-xs
            rounded-full
            bg-red-100
            text-red-600
            hover:bg-red-200
            transition
            whitespace-nowrap
          "
        >
          Remove
        </button>

      </div>

    </div>

    {/* SUMMARY TEXT */}
    <p className="text-sm leading-relaxed break-words">
      {aiSummary}
    </p>

  </div>
)}

      </div>

    </div>

  )
}
