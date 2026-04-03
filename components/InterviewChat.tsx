'use client'

import { useEffect, useRef, useState } from 'react'
import type { DigitalTwin, Message, ProjectInfo } from '@/lib/types'
import { getInitials, TWIN_SIDEBAR_COLORS, getTwinIndex, formatTime } from '@/lib/types'

interface InterviewChatProps {
  projectInfo: ProjectInfo
  twins: DigitalTwin[]
  initialMessages: Message[]
  onGenerateReport: (messages: Message[]) => void
  onBack: () => void
}

const SUGGESTED: Record<'problem' | 'value', string[]> = {
  problem: [
    'What is your current workaround?',
    'Who else feels this pain in your team?',
    "What's the #1 feature you need?",
    'How often does this block your work?',
    'Have you ever paid for a solution before?',
  ],
  value: [
    'Would you use this today if it existed?',
    'What would you pay per month?',
    'What would stop you from switching?',
    'Who else would benefit from this?',
    'How does this compare to your current tool?',
  ],
}

const BUBBLE_COLORS = [
  'bg-amber-50 border-amber-100',
  'bg-emerald-50 border-emerald-100',
  'bg-blue-50 border-blue-100',
  'bg-purple-50 border-purple-100',
  'bg-rose-50 border-rose-100',
]

function TwinAvatar({ twin }: { twin: DigitalTwin }) {
  const idx = getTwinIndex(twin.id)
  const colorClass = TWIN_SIDEBAR_COLORS[idx] ?? TWIN_SIDEBAR_COLORS[0]
  return (
    <div
      className={`w-8 h-8 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold flex-shrink-0`}
    >
      {getInitials(twin.name)}
    </div>
  )
}

function ChatBubble({ message, twins }: { message: Message; twins: DigitalTwin[] }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end px-6 py-2">
        <div className="max-w-[70%] bg-forest text-white text-sm px-5 py-3.5 rounded-2xl rounded-tr-sm leading-relaxed">
          {message.content}
        </div>
      </div>
    )
  }

  const twin = twins.find((t) => t.id === message.twinId)
  const idx = twin ? getTwinIndex(twin.id) : 0
  const bubbleColor = BUBBLE_COLORS[idx] ?? BUBBLE_COLORS[0]

  return (
    <div className="px-6 py-3">
      <div className="flex items-start gap-3">
        {twin ? (
          <TwinAvatar twin={twin} />
        ) : (
          <div className="w-8 h-8 rounded-full bg-forest/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className={`border ${bubbleColor} rounded-2xl rounded-tl-sm px-5 py-4 text-sm text-forest/80 leading-relaxed`}>
            &ldquo;{message.content}&rdquo;
          </div>
          <p className="text-[10px] font-bold tracking-widest uppercase text-forest/30 mt-2 ml-1">
            {message.twinName?.toUpperCase()}{message.timestamp ? ` • ${message.timestamp}` : ''}
          </p>
        </div>
      </div>
    </div>
  )
}

function TypingIndicator({ twin }: { twin: DigitalTwin | undefined }) {
  return (
    <div className="px-6 py-3 flex items-center gap-3">
      {twin ? (
        <TwinAvatar twin={twin} />
      ) : (
        <div className="w-8 h-8 rounded-full bg-forest/20 flex-shrink-0" />
      )}
      <div className="flex gap-1.5 px-5 py-4 bg-amber-50 border border-amber-100 rounded-2xl rounded-tl-sm">
        <span className="w-1.5 h-1.5 bg-forest/40 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-1.5 h-1.5 bg-forest/40 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-1.5 h-1.5 bg-forest/40 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  )
}

export default function InterviewChat({
  projectInfo,
  twins,
  initialMessages,
  onGenerateReport,
  onBack,
}: InterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [selectedTwinId, setSelectedTwinId] = useState<string>('all')
  const [mode, setMode] = useState<'problem' | 'value'>('problem')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const selectedTwin =
    selectedTwinId === 'all' ? null : twins.find((t) => t.id === selectedTwinId) ?? null

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const now = new Date()
    const userMessage: Message = { role: 'user', content: text.trim(), timestamp: formatTime(now) }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectInfo,
          twins,
          selectedTwinId,
          mode,
          messages: newMessages.slice(0, -1),
          userMessage: text.trim(),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const ts = formatTime(now)

      if (selectedTwinId === 'all') {
        // API returns { responses: [{ twinId, twinName, text }] }
        const incoming: Message[] = (
          data.responses as { twinId: string; twinName: string; text: string }[]
        ).map((r) => ({
          role: 'assistant' as const,
          content: r.text,
          twinId: r.twinId,
          twinName: r.twinName,
          timestamp: ts,
        }))
        setMessages([...newMessages, ...incoming])
      } else {
        const twin = twins.find((t) => t.id === selectedTwinId)
        setMessages([
          ...newMessages,
          {
            role: 'assistant' as const,
            content: data.response,
            twinId: selectedTwinId,
            twinName: twin?.name,
            timestamp: ts,
          },
        ])
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant' as const,
          content: 'Sorry, something went wrong. Please try again.',
          twinId: selectedTwinId,
          timestamp: formatTime(),
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const userQCount = messages.filter((m) => m.role === 'user').length
  const canReport = userQCount >= 2
  const sessionPct = Math.min(Math.round((userQCount / 6) * 100), 100)

  return (
    <div className="flex h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white border-r border-mint-dark flex-col overflow-hidden hidden sm:flex">
        <div className="p-5 border-b border-mint-dark">
          <h3 className="font-bold text-forest text-sm">Market Twins</h3>
          <p className="text-xs text-forest/40 mt-0.5">Select a persona to begin the validation interview.</p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin">
          {/* All twins option */}
          <button
            onClick={() => setSelectedTwinId('all')}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
              selectedTwinId === 'all' ? 'bg-mint border border-forest/15' : 'hover:bg-mint/50'
            }`}
          >
            <div className="w-9 h-9 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-forest/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-forest truncate">Group Interview</p>
              <p className="text-[10px] text-forest/40 uppercase tracking-wider">All {twins.length} Twins</p>
            </div>
          </button>

          {twins.map((twin) => {
            const idx = getTwinIndex(twin.id)
            const colorClass = TWIN_SIDEBAR_COLORS[idx] ?? TWIN_SIDEBAR_COLORS[0]
            const isSelected = selectedTwinId === twin.id
            return (
              <button
                key={twin.id}
                onClick={() => setSelectedTwinId(twin.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${
                  isSelected ? 'bg-mint border border-forest/15' : 'hover:bg-mint/50'
                }`}
              >
                <div className={`w-9 h-9 rounded-full ${colorClass} flex items-center justify-center text-xs font-bold flex-shrink-0`}>
                  {getInitials(twin.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-forest truncate">{twin.name}</p>
                  <p className="text-[10px] text-forest/40 uppercase tracking-wider truncate">{twin.occupation}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Back button in sidebar */}
        <div className="p-3 border-t border-mint-dark">
          <button
            onClick={onBack}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-forest/50 hover:text-forest hover:bg-mint text-xs font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Twins
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white border-b border-mint-dark px-6 py-4 flex items-center justify-between flex-shrink-0 gap-3">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-forest/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <h2 className="font-bold text-forest text-sm truncate">
              Interview with {selectedTwinId === 'all' ? 'All Twins' : selectedTwin?.name ?? ''}
            </h2>
          </div>

          {/* Mode tabs + session progress */}
          <div className="flex items-center gap-1 rounded-xl overflow-hidden border border-forest/10 bg-mint flex-shrink-0">
            {(['problem', 'value'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 sm:px-4 py-2 text-xs font-bold tracking-wider uppercase transition-colors ${
                  mode === m ? 'bg-forest text-white' : 'text-forest/40 hover:text-forest/70'
                }`}
              >
                {m === 'problem' ? 'Problem' : 'Value'}
              </button>
            ))}
            <div className="px-3 py-2 flex items-center gap-2 border-l border-forest/10">
              <div className="w-12 h-1 bg-forest/10 rounded-full overflow-hidden">
                <div className="h-full bg-forest rounded-full transition-all" style={{ width: `${sessionPct}%` }} />
              </div>
              <span className="text-[10px] font-bold text-forest/30 uppercase tracking-wider hidden sm:block whitespace-nowrap">
                Progress
              </span>
            </div>
          </div>
        </div>

        {/* Context heading (when no messages yet) */}
        {messages.length === 0 && (
          <div className="px-8 py-10 text-center flex-shrink-0 border-b border-mint-dark bg-white/40">
            <p className="text-[10px] font-bold tracking-widest uppercase text-forest/30 mb-3">
              {mode === 'problem' ? 'Phase 01: Context Exploration' : 'Phase 02: Value Assessment'}
            </p>
            <h3 className="text-xl sm:text-2xl font-black text-forest leading-tight mb-2 max-w-lg mx-auto">
              {selectedTwinId === 'all'
                ? mode === 'problem'
                  ? 'Exploring the market pain points together.'
                  : 'Testing your value proposition as a group.'
                : mode === 'problem'
                ? `Understanding ${selectedTwin?.name.split(' ')[0]}'s workflow challenges.`
                : `Exploring ${selectedTwin?.name.split(' ')[0]}'s openness to new solutions.`}
            </h3>
            <p className="text-sm text-forest/40 max-w-md mx-auto">
              {selectedTwinId === 'all'
                ? 'Each twin will respond individually. Use the suggested questions below to get started.'
                : `${selectedTwin?.name} is ready. Ask about their specific experience with the problem.`}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} twins={twins} />
          ))}
          {loading && <TypingIndicator twin={selectedTwin ?? twins[0]} />}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        <div className="px-6 py-3 border-t border-mint-dark bg-white/60 flex flex-wrap gap-2 flex-shrink-0">
          {SUGGESTED[mode].map((q) => (
            <button
              key={q}
              onClick={() => setInput(q)}
              className="text-xs px-3 py-1.5 rounded-full border border-forest/15 text-forest/50 hover:border-forest/40 hover:text-forest/70 transition-colors bg-white"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input bar — white background, dark text */}
        <div className="bg-white border-t border-mint-dark px-4 py-3 flex gap-3 items-end flex-shrink-0">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your follow-up question here..."
            rows={1}
            className="flex-1 bg-white text-forest placeholder-forest/30 text-sm outline-none resize-none border border-mint-dark rounded-xl px-4 py-2.5 focus:border-forest/30 transition-colors"
            style={{ minHeight: '42px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-forest text-white flex items-center justify-center hover:bg-forest-light disabled:opacity-30 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Bottom bar: hint + generate report */}
        <div className="bg-white border-t border-mint-dark px-6 py-2.5 flex items-center justify-between flex-shrink-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-forest/30">
            <kbd className="bg-mint-dark text-forest/50 px-1.5 py-0.5 rounded text-[10px] font-mono">SHIFT</kbd>
            {' + '}
            <kbd className="bg-mint-dark text-forest/50 px-1.5 py-0.5 rounded text-[10px] font-mono">ENTER</kbd>
            {' for new line'}
          </p>
          <button
            onClick={() => onGenerateReport(messages)}
            disabled={!canReport}
            className="text-xs font-bold text-forest/40 hover:text-forest disabled:opacity-30 disabled:cursor-not-allowed transition-colors underline underline-offset-2"
          >
            {canReport
              ? `Generate Report (${userQCount} questions)`
              : `Ask ${2 - userQCount} more to generate report`}
          </button>
        </div>
      </div>
    </div>
  )
}
