import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreatorStoreOrNull } from '../context/CreatorStoreContext'
import {
  askCopilot,
  buildSystemPrompt,
  loadConversation,
  saveConversation,
  clearConversation,
  CopilotError,
  SUGGESTED_PROMPTS,
  type CopilotMessage,
  type CopilotContext,
} from '../services/copilotService'

const ease = [0.16, 1, 0.3, 1] as const

// ── Typing indicator ──────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-1 px-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: '#F5A653' }}
          animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.85, 1.2, 0.85] }}
          transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
        />
      ))}
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────

function MessageBubble({
  message,
  isStreaming,
}: {
  message: CopilotMessage
  isStreaming?: boolean
}) {
  const isUser = message.role === 'user'

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, ease }}
        className="flex justify-end"
      >
        <div
          className="max-w-[85%] rounded-2xl rounded-br-sm px-4 py-3 border"
          style={{ background: '#1C1A17', borderColor: 'rgba(42,39,34,0.7)' }}
        >
          <p className="font-sans text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease }}
      className="flex items-start gap-3"
    >
      {/* Copilot avatar */}
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
        style={{
          background: 'rgba(245,166,83,0.1)',
          border: '1px solid rgba(245,166,83,0.25)',
        }}
      >
        <span className="font-mono text-[10px]" style={{ color: '#F5A653' }}>
          ✦
        </span>
      </div>

      <div className="flex-1 min-w-0">
        {isStreaming && message.content === '' ? (
          <TypingDots />
        ) : (
          <p className="font-sans text-[13px] text-white/65 leading-relaxed whitespace-pre-wrap">
            {message.content}
            {isStreaming && (
              <motion.span
                className="inline-block w-0.5 h-[13px] ml-0.5 align-middle"
                style={{ background: '#F5A653' }}
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
              />
            )}
          </p>
        )}
      </div>
    </motion.div>
  )
}

// ── Suggested prompt chip ──────────────────────────────────────

function PromptChip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="text-left px-3 py-2 rounded-xl border border-studio-brd font-sans text-[12px] text-white/40 hover:text-white/70 hover:border-studio-ele transition-all duration-150"
      style={{ background: '#141210' }}
    >
      {text}
    </button>
  )
}

// ── Main panel ────────────────────────────────────────────────

export default function CopilotPanel() {
  const store = useCreatorStoreOrNull()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<CopilotMessage[]>(() => loadConversation())
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamContent, setStreamContent] = useState('')

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  // Mutable ref so the streaming callback never has a stale closure
  const streamRef = useRef('')

  // ── Context + system prompt ────────────────────────────────

  const ctx: CopilotContext | null = store
    ? {
        analysisHistory: store.analysisHistory,
        allBrands: store.allBrands,
        savedBrandIds: store.savedBrandIds,
        matchResult: store.matchResult,
        briefFeed: store.briefFeed,
      }
    : null

  const systemPrompt = useMemo(
    () => buildSystemPrompt(ctx),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      store?.matchResult,
      store?.analysisHistory.length,
      store?.briefFeed.length,
      store?.savedBrandIds.size,
    ],
  )

  // ── Scroll to bottom ───────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamContent])

  // ── Focus input when opened ────────────────────────────────

  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [isOpen])

  // ── Input handlers ─────────────────────────────────────────

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInput(e.target.value)
    // Auto-resize
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSend()
    }
  }

  // ── Send message ───────────────────────────────────────────

  const handleSend = useCallback(async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || isStreaming) return

    const userMsg: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    const withUser = [...messages, userMsg]
    setMessages(withUser)
    setInput('')
    setIsStreaming(true)
    setStreamContent('')
    streamRef.current = ''

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    try {
      await askCopilot(withUser, systemPrompt, (chunk) => {
        streamRef.current += chunk
        setStreamContent(streamRef.current)
      })

      const assistantMsg: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: streamRef.current,
        timestamp: new Date().toISOString(),
      }
      const final = [...withUser, assistantMsg]
      setMessages(final)
      saveConversation(final)
    } catch (err) {
      const errorText =
        err instanceof CopilotError
          ? err.message
          : 'Something went wrong. Please try again.'
      const errorMsg: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `⚠ ${errorText}`,
        timestamp: new Date().toISOString(),
      }
      const final = [...withUser, errorMsg]
      setMessages(final)
      saveConversation(final)
    } finally {
      setIsStreaming(false)
      setStreamContent('')
    }
  }, [input, isStreaming, messages, systemPrompt])

  // ── Clear history ──────────────────────────────────────────

  function handleClear() {
    clearConversation()
    setMessages([])
  }

  // ── Displayed messages (streaming splice) ──────────────────

  const displayMessages: CopilotMessage[] = isStreaming
    ? [
        ...messages,
        {
          id: 'streaming',
          role: 'assistant',
          content: streamContent,
          timestamp: '',
        },
      ]
    : messages

  const isEmpty = displayMessages.length === 0

  // ── Render ─────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating action button (hidden when panel open) ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="copilot-fab"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease }}
            whileHover={{ scale: 1.07 }}
            whileTap={{ scale: 0.93 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-[145] w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #D97C28 0%, #9A4E10 100%)',
              boxShadow: '0 8px 24px rgba(217,124,40,0.38), 0 0 0 1px rgba(245,166,83,0.2)',
            }}
            aria-label="Open AI Copilot"
          >
            <span className="font-mono text-[18px] text-white leading-none select-none">✦</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Side panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="copilot-panel"
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ duration: 0.3, ease }}
            className="fixed right-0 top-0 h-full z-[150] flex flex-col border-l border-studio-brd"
            style={{ width: '400px', background: '#0F0E0B' }}
          >
            {/* Header */}
            <div
              className="h-14 px-5 flex items-center gap-3 border-b border-studio-brd shrink-0"
              style={{ background: '#0A0908' }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: 'rgba(245,166,83,0.1)',
                  border: '1px solid rgba(245,166,83,0.25)',
                }}
              >
                <span className="font-mono text-[12px]" style={{ color: '#F5A653' }}>✦</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-sans text-[13px] font-semibold text-white/85">AI Copilot</div>
                <div className="font-sans text-[10px] text-white/25">
                  {ctx?.matchResult ? 'Context loaded' : 'Add data to unlock insights'}
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/5 transition-all duration-150"
                    title="Clear conversation"
                  >
                    <span className="font-mono text-[13px]">⌫</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all duration-150"
                  title="Close"
                >
                  <span className="font-mono text-[15px] leading-none">✕</span>
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {isEmpty ? (
                /* Empty state */
                <div className="h-full flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                      style={{
                        background: 'rgba(245,166,83,0.08)',
                        border: '1px solid rgba(245,166,83,0.18)',
                      }}
                    >
                      <span className="font-mono text-2xl" style={{ color: '#F5A653' }}>✦</span>
                    </div>
                    <div className="font-sans text-[14px] font-medium text-white/60 mb-2">
                      Intent AI Copilot
                    </div>
                    <p className="font-sans text-[12px] text-white/30 leading-relaxed max-w-[220px]">
                      Ask anything about your brands, content strategy, approval risks, or campaign data.
                    </p>
                  </div>

                  {/* Suggested prompts */}
                  <div className="space-y-2">
                    <div className="label-caps text-white/20 mb-3" style={{ fontSize: '9px' }}>
                      Suggested
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {SUGGESTED_PROMPTS.slice(0, 6).map((prompt) => (
                        <PromptChip
                          key={prompt}
                          text={prompt}
                          onClick={() => void handleSend(prompt)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Message list */
                <>
                  {displayMessages.map((msg) => (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isStreaming={msg.id === 'streaming'}
                    />
                  ))}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Suggested prompts (when messages exist) */}
            {!isEmpty && !isStreaming && (
              <div className="px-5 pb-2 border-t border-studio-brd/40 pt-3">
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {SUGGESTED_PROMPTS.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => void handleSend(prompt)}
                      className="shrink-0 px-3 py-1.5 rounded-full border border-studio-brd/60 font-sans text-[11px] text-white/30 hover:text-white/60 hover:border-studio-ele transition-all duration-150 whitespace-nowrap"
                      style={{ background: '#141210' }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input area */}
            <div className="px-4 py-4 border-t border-studio-brd shrink-0">
              <div
                className="flex items-end gap-3 rounded-xl border border-studio-brd px-4 py-3 transition-colors duration-150 focus-within:border-studio-ele"
                style={{ background: '#141210' }}
              >
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about brands, content, strategy…"
                  rows={1}
                  disabled={isStreaming}
                  className="flex-1 bg-transparent font-sans text-[13px] text-white outline-none resize-none disabled:opacity-40"
                  style={{
                    maxHeight: '120px',
                    lineHeight: '1.55',
                    caretColor: '#F5A653',
                  }}
                  spellCheck={false}
                />
                <button
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || isStreaming}
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150 disabled:opacity-25"
                  style={{
                    background:
                      input.trim() && !isStreaming
                        ? 'linear-gradient(135deg, #D97C28, #9A4E10)'
                        : '#2A2722',
                  }}
                >
                  <span className="font-mono text-[14px] text-white leading-none">→</span>
                </button>
              </div>
              <p className="font-sans text-[9px] text-white/15 mt-2 text-center select-none">
                ↵ send · shift+↵ newline
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
