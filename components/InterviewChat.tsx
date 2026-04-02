'use client'

import { useEffect, useRef, useState } from 'react'
import type { DigitalTwin, Message, ProjectInfo } from '@/lib/types'
import { TWIN_COLORS } from '@/lib/types'

interface InterviewChatProps {
  projectInfo: ProjectInfo
  twins: DigitalTwin[]
  onGenerateReport: (messages: Message[]) => void
}

const SUGGESTED_QUESTIONS: Record<'problem' | 'value', string[]> = {
  problem: [
    'How often do you encounter this problem?',
    'How do you currently handle this situation?',
    'How painful is this problem, on a scale of 1–10?',
    "What's the worst part about your current approach?",
    'Have you ever paid for a solution to this before?',
    'What would change in your work if this problem disappeared?',
  ],
  value: [
    'Would you use this solution if it existed today?',
    'How much would you be willing to pay per month?',
    'What feature would matter most to you?',
    'What would stop you from switching to this?',
    'How does this compare to what you use today?',
    'Who else on your team or in your life would benefit from this?',
  ],
}

function Avatar({ twin, size = 'sm' }: { twin: DigitalTwin; size?: 'sm' | 'md' }) {
  const colors = TWIN_COLORS[twin.id] ?? TWIN_COLORS.twin1
  const initials = twin.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  const sizeClass = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div
      className={`${sizeClass} rounded-full ${colors.bg} ${colors.text} flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  )
}

function MessageBubble({ message, twins }: { message: Message; twins: DigitalTwin[] }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-black text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm">
          {message.content}
        </div>
      </div>
    )
  }

  // Multi-twin response: parse and render each twin separately
  if (message.twinId === 'all') {
    const lines = message.content.split(/\n\n/)
    const parsed: { name: string; text: string; twin?: DigitalTwin }[] = []
    for (const line of lines) {
      const match = line.match(/^\*\*(.+?)\*\*:\s*(.+)$/s)
      if (match) {
        const twinMatch = twins.find((t) => t.name === match[1])
        parsed.push({ name: match[1], text: match[2].trim(), twin: twinMatch })
      }
    }

    if (parsed.length === 0) {
      return (
        <div className="flex gap-2 items-start">
          <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
          <div className="max-w-[80%] bg-white border border-gray-200 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm text-gray-800">
            {message.content}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3">
        {parsed.map((p, i) => (
          <div key={i} className="flex gap-2 items-start">
            {p.twin ? (
              <Avatar twin={p.twin} />
            ) : (
              <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
            )}
            <div className="max-w-[80%]">
              <p className="text-xs font-medium text-gray-500 mb-1">{p.name}</p>
              <div className="bg-white border border-gray-200 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm text-gray-800 leading-relaxed">
                {p.text}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Single twin response
  const twin = twins.find((t) => t.id === message.twinId)
  return (
    <div className="flex gap-2 items-start">
      {twin ? (
        <Avatar twin={twin} />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
      )}
      <div className="max-w-[80%]">
        {twin && <p className="text-xs font-medium text-gray-500 mb-1">{twin.name}</p>}
        <div className="bg-white border border-gray-200 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm text-gray-800 leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  )
}

export default function InterviewChat({ projectInfo, twins, onGenerateReport }: InterviewChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedTwinId, setSelectedTwinId] = useState<string>('all')
  const [mode, setMode] = useState<'problem' | 'value'>('problem')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMessage: Message = { role: 'user', content: text.trim() }
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
          messages: newMessages.slice(0, -1), // history before this message
          userMessage: text.trim(),
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const selectedTwin = twins.find((t) => t.id === selectedTwinId)
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        twinId: selectedTwinId,
        twinName: selectedTwinId === 'all' ? 'All Twins' : selectedTwin?.name,
      }
      setMessages([...newMessages, assistantMessage])
    } catch {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.', twinId: selectedTwinId },
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

  const canGenerateReport = messages.filter((m) => m.role === 'user').length >= 2

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header controls */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Mode toggle */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Interview mode</p>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden w-fit">
              {(['problem', 'value'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    mode === m
                      ? 'bg-black text-white'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {m === 'problem' ? 'Problem Validation' : 'Value Proposition'}
                </button>
              ))}
            </div>
          </div>

          {/* Twin selector */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Speaking with</p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedTwinId('all')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                  selectedTwinId === 'all'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                All Twins
              </button>
              {twins.map((twin) => {
                const colors = TWIN_COLORS[twin.id] ?? TWIN_COLORS.twin1
                return (
                  <button
                    key={twin.id}
                    onClick={() => setSelectedTwinId(twin.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      selectedTwinId === twin.id
                        ? `${colors.badge} border-transparent`
                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {twin.name.split(' ')[0]}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden">
        {/* Messages */}
        <div className="h-80 sm:h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-center">
              <div>
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Start asking questions below.</p>
                <p className="text-xs text-gray-400 mt-1">Use the suggested questions or write your own.</p>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} twins={twins} />
          ))}
          {loading && (
            <div className="flex gap-2 items-center">
              <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 animate-pulse" />
              <div className="flex gap-1 px-4 py-3 bg-white border border-gray-200 rounded-2xl rounded-tl-sm">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        <div className="border-t border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium text-gray-400 mb-2">Suggested questions</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTED_QUESTIONS[mode].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-xs px-2.5 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full text-gray-600 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 bg-white px-4 py-3 flex gap-2 items-end">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question... (Enter to send, Shift+Enter for newline)"
            rows={1}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 resize-none bg-white text-gray-900 placeholder-gray-400"
            style={{ minHeight: '38px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            Send
          </button>
        </div>
      </div>

      {/* Generate Report */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {messages.filter((m) => m.role === 'user').length} question
          {messages.filter((m) => m.role === 'user').length !== 1 ? 's' : ''} asked
          {!canGenerateReport && ' — ask at least 2 to generate a report'}
        </p>
        <button
          onClick={() => onGenerateReport(messages)}
          disabled={!canGenerateReport}
          className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          Generate Report
        </button>
      </div>
    </div>
  )
}
