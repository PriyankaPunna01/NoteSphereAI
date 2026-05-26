'use client'

export const dynamic = 'force-static' 
import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
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
  const noteId = params.id as string
  const supabase = createClient()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [textAlign, setTextAlign] = useState('left')
  const [theme, setTheme] = useState('Light')
  const [noteType, setNoteType] = useState('Text Note')

  const [audioUrls, setAudioUrls] = useState<string[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageCaptions, setImageCaptions] = useState<string[]>([])
  const [voiceTranscript, setVoiceTranscript] = useState('')

  const [aiSummary, setAiSummary] = useState('')
  const [category, setCategory] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isParaphrasing, setIsParaphrasing] = useState(false)

  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    async function loadNote() {
      try {
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('id', noteId)
          .single()

        if (error) throw error

        setTitle(data.title || '')
        setContent(data.content || '')
        setTheme(data.theme || 'Light')
        setNoteType(data.note_type || 'Text Note')
        setAudioUrls(data.audio_urls || [])
        setImageUrls(data.image_urls || [])
        setImageCaptions(
          data.image_captions ||
            new Array((data.image_urls || []).length).fill('')
        )
        setVoiceTranscript(data.voice_transcript || '')
        setAiSummary(data.ai_summary || '')
        setCategory(data.category || '')
      } catch (error) {
        console.error('Error loading note:', error)
        router.push('/dashboard')
      } finally {
        setIsLoading(false)
      }
    }

    loadNote()
  }, [noteId, router, supabase])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event: any) => {
      let transcript = ''
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript + ' '
      }
      setVoiceTranscript(transcript.trim())
    }

    recognitionRef.current = recognition
  }, [])

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
    const fullContent = [title, content, voiceTranscript, imageCaptions.join('\n')]
      .filter(Boolean)
      .join('\n\n')

    if (!fullContent.trim()) { alert('No content available to analyze.'); return }
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fullContent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'AI analysis failed.')
      setAiSummary(data.summary || '')
      setCategory(data.category || '')
      await supabase.from('notes').update({
        ai_summary: data.summary || '',
        category: data.category || '',
      }).eq('id', noteId)
    } catch (error) {
      console.error('AI analysis error:', error)
      alert('Failed to analyze note.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleParaphrase = async () => {
    const fullContent = content.trim()
    if (!fullContent) { alert('No content available to paraphrase.'); return }
    setIsParaphrasing(true)
    try {
      const res = await fetch('/api/paraphrase-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fullContent }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to paraphrase note.')
      setContent(data.paraphrased || '')
    } catch (error) {
      console.error('Paraphrase error:', error)
      alert('Failed to paraphrase note.')
    } finally {
      setIsParaphrasing(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('notes')
        .update({
          title,
          content,
          theme,
          note_type: noteType,
          audio_urls: audioUrls,
          image_urls: imageUrls.filter((url) => !url.startsWith('blob:')),
          image_captions: imageCaptions,
          voice_transcript: voiceTranscript,
          ai_summary: aiSummary,
          category,
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
      if (error) throw error
      router.push('/dashboard')
    } catch (error) {
      console.error('Error saving note:', error)
      alert('Failed to save note.')
    } finally {
      setIsSaving(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data)
      }
      mediaRecorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
          const fileName = `${noteId}-${Date.now()}.webm`
          const { error: uploadError } = await supabase.storage
            .from('voice-notes')
            .upload(fileName, audioBlob, { contentType: 'audio/webm' })
          if (uploadError) throw uploadError
          const { data } = supabase.storage.from('voice-notes').getPublicUrl(fileName)
          setAudioUrls((prev) => [...prev, data.publicUrl])
          stream.getTracks().forEach((track) => track.stop())
        } catch (error) {
          console.error('Audio upload error:', error)
          alert('Failed to upload audio.')
        }
      }
      setVoiceTranscript('')
      recognitionRef.current?.start()
      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      alert('Unable to access microphone.')
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    recognitionRef.current?.stop()
    setIsRecording(false)
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const previewUrl = URL.createObjectURL(file)
    setImageUrls((prev) => [...prev, previewUrl])
    setImageCaptions((prev) => [...prev, ''])
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${noteId}-${Date.now()}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('image_bucket').upload(fileName, file)
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('image_bucket').getPublicUrl(fileName)
      setImageUrls((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = data.publicUrl
        return updated
      })
      event.target.value = ''
    } catch (error) {
      console.error('Image upload error:', error)
      alert('Failed to upload image.')
    }
  }

  const updateImageCaption = (index: number, value: string) => {
    const updated = [...imageCaptions]
    updated[index] = value
    setImageCaptions(updated)
  }

  const removeImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, index) => index !== indexToRemove))
    setImageCaptions((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  const alignOptions = [
    { value: 'left', label: '⬅ Left' },
    { value: 'center', label: '↔ Center' },
    { value: 'right', label: '➡ Right' },
    { value: 'justify', label: '☰ Justify' },
  ]

  if (isLoading) {
    return <div className="p-6">Loading...</div>
  }

  return (
    <div className="w-full overflow-x-hidden px-3 sm:px-6 py-4">

      {/* ── Compact Toolbar ── */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">

        {/* Back */}
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-1.5 text-sm font-medium text-foreground hover:opacity-70 transition-opacity mr-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Theme pill */}
        <div className="relative flex items-center">
          <Palette className="w-3.5 h-3.5 absolute left-2.5 text-muted-foreground pointer-events-none" />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="appearance-none pl-7 pr-6 py-1.5 text-xs font-medium bg-secondary border border-border rounded-full text-foreground cursor-pointer hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {themes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 text-muted-foreground pointer-events-none" />
        </div>

        {/* Align pill */}
        <div className="relative flex items-center">
          <select
            value={textAlign}
            onChange={(e) => setTextAlign(e.target.value)}
            className="appearance-none pl-3 pr-6 py-1.5 text-xs font-medium bg-secondary border border-border rounded-full text-foreground cursor-pointer hover:bg-secondary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {alignOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="w-3 h-3 absolute right-2 text-muted-foreground pointer-events-none" />
        </div>

        {/* AI + Rewrite + Save — pushed to right on larger screens */}
        <div className="flex items-center gap-2 sm:ml-auto">
          <button
            onClick={handleAnalyzeNote}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <Bot className="w-3.5 h-3.5" />
            {isAnalyzing ? 'Analyzing…' : 'AI'}
          </button>

          <button
            onClick={handleParaphrase}
            disabled={isParaphrasing}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-border rounded-full hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <PenLine className="w-3.5 h-3.5" />
            {isParaphrasing ? 'Rewriting…' : 'Rewrite'}
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* ── Main Note Container ── */}
      <div className={`w-full max-w-full sm:max-w-5xl mx-auto p-4 sm:p-8 transition-all duration-500 overflow-hidden ${getThemeClass()}`}>

        {/* Note Type */}
        <div className="mb-6">
          <div className="relative inline-flex items-center">
            <select
              value={noteType}
              onChange={(e) => setNoteType(e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-xs font-medium bg-white/80 border border-border rounded-full text-slate-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {noteTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 absolute right-2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Voice Note */}
        {(noteType === 'Voice Note' || noteType === 'Mixed Note') && (
          <div className="mb-6 border rounded-xl p-4 bg-white/70 w-full overflow-hidden">
            <h3 className="font-semibold mb-4 text-lg">🎤 Voice Notes</h3>
            {!isRecording ? (
              <Button onClick={startRecording} variant="outline" className="w-full sm:w-auto">
                <Mic className="w-4 h-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="w-full sm:w-auto">
                <Square className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}
            <div className="space-y-4 mt-4">
              {audioUrls.map((url, index) => (
                <audio key={index} controls src={url} className="w-full" />
              ))}
            </div>
            {voiceTranscript && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">📝 Voice Transcript</h4>
                <textarea
                  value={voiceTranscript}
                  onChange={(e) => setVoiceTranscript(e.target.value)}
                  className="w-full min-h-[120px] p-3 border rounded-lg"
                />
              </div>
            )}
          </div>
        )}

        {/* Text Notes */}
        {(noteType === 'Text Note' || noteType === 'Mixed Note') && (
          <>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
              className="text-2xl sm:text-4xl font-bold border-0 shadow-none px-0 bg-transparent"
              style={{ textAlign: textAlign as any }}
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start typing..."
              style={{ textAlign: textAlign as any }}
              className="w-full min-h-[250px] sm:min-h-[500px] mt-6 resize-none focus:outline-none bg-transparent text-base sm:text-lg"
            />
          </>
        )}

        {/* ── AI Summary Section ── */}
        {isAnalyzing && (
          <div className="mt-8 p-4 rounded-2xl border border-border bg-white/60 backdrop-blur-sm animate-pulse">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Generating summary…
              </h4>
            </div>
            <div className="h-3 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-1/2" />
          </div>
        )}

        {aiSummary && !isAnalyzing && (
          <div className="mt-8 p-4 rounded-2xl border border-border bg-white/60 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-3">
              <Bot className="w-4 h-4 text-muted-foreground" />
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                AI Summary
              </h4>
              {category && (
                <span className="ml-auto text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground font-medium border border-border">
                  {category}
                </span>
              )}
            </div>
            <p className="text-sm leading-relaxed text-foreground">{aiSummary}</p>
          </div>
        )}

      </div>
    </div>
  )
}
