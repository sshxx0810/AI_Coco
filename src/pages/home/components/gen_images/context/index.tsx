import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  fetchLatestSessionHistory,
  initImageSession,
  sendImageSessionMessage,
  type BackendSessionHistoryItem,
} from '../../../../../api/imageSessionApi'
import { useSidebar } from '../../context'

export type ImageChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text: string
  images: string[]
  createdAt: number
  status?: 'ok' | 'error'
}

export type ImageSessionHistoryItem = {
  sessionId: string
  title: string
  messages: ImageChatMessage[]
  createdAt: number
  updatedAt: number
}

type ImageSessionContextType = {
  sessionId: string | null
  messages: ImageChatMessage[]
  sending: boolean
  historySessions: ImageSessionHistoryItem[]
  sendMessage: (params: {
    prompt: string
    files: File[]
  }) => Promise<void>
  openSessionFromHistory: (targetSessionId: string) => void
  closeCurrentSession: () => void
  clearSession: () => void
}

const BASE_URL = (import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000').replace(/\/+$/, '')

const ImageSessionContext = createContext<ImageSessionContextType>({
  sessionId: null,
  messages: [],
  sending: false,
  historySessions: [],
  sendMessage: async () => undefined,
  openSessionFromHistory: () => undefined,
  closeCurrentSession: () => undefined,
  clearSession: () => undefined,
})

const makeId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

const normalizeImageUrl = (url: string) => {
  if (!url) {
    return ''
  }

  if (/^https?:\/\//i.test(url) || url.startsWith('data:')) {
    return url
  }

  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

const toTimestamp = (value?: string | null, fallback = Date.now()) => {
  if (!value) {
    return fallback
  }

  const ts = Date.parse(value)
  return Number.isNaN(ts) ? fallback : ts
}

const buildSessionTitle = (messages: ImageChatMessage[], fallback = '新会话') => {
  const firstUserText = messages.find((item) => item.role === 'user' && item.text?.trim())?.text?.trim()

  if (firstUserText) {
    return firstUserText
  }

  const firstText = messages.find((item) => item.text?.trim())?.text?.trim()
  return firstText || fallback
}

const mapBackendHistory = (items: BackendSessionHistoryItem[]): ImageSessionHistoryItem[] => {
  return items.map((session) => {
    const createdAt = toTimestamp(session.startedAt)
    const updatedAt = toTimestamp(session.endedAt || session.startedAt, createdAt)

    const mappedMessages: ImageChatMessage[] = session.messages.map((msg, idx) => ({
      id: `${session.sessionId}-${idx}-${Math.random().toString(36).slice(2, 7)}`,
      role: msg.sender,
      text: msg.content || '',
      images: [
        ...(Array.isArray(msg.files) ? msg.files.map((item) => normalizeImageUrl(item)) : []),
        ...(msg.file ? [normalizeImageUrl(msg.file)] : []),
      ].filter(Boolean),
      createdAt: toTimestamp(msg.timestamp, createdAt),
      status: 'ok',
    }))

    return {
      sessionId: String(session.sessionId),
      title: buildSessionTitle(mappedMessages, session.title || '新会话'),
      messages: mappedMessages,
      createdAt,
      updatedAt,
    }
  })
}

export const ImageSessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoggedIn } = useSidebar()

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ImageChatMessage[]>([])
  const [historySessions, setHistorySessions] = useState<ImageSessionHistoryItem[]>([])
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setSessionId(null)
    setMessages([])
    setHistorySessions([])

    if (!isLoggedIn) {
      return
    }

    let cancelled = false

    const loadRemoteHistory = async () => {
      try {
        const remote = await fetchLatestSessionHistory(10)
        if (cancelled) {
          return
        }

        const mapped = mapBackendHistory(remote)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 10)
        setHistorySessions(mapped)
      } catch {
        setHistorySessions([])
      }
    }

    void loadRemoteHistory()

    return () => {
      cancelled = true
    }
  }, [user.username, isLoggedIn])

  const ensureSessionId = async (params: { prompt: string; files: File[] }) => {
    if (sessionId) {
      return sessionId
    }

    const id = await initImageSession(params)
    setSessionId(id)
    return id
  }

  const sendMessage: ImageSessionContextType['sendMessage'] = async (params) => {
    const userImages = params.files.map((file) => URL.createObjectURL(file))
    const userMessage: ImageChatMessage = {
      id: makeId(),
      role: 'user',
      text: params.prompt,
      images: userImages,
      createdAt: Date.now(),
      status: 'ok',
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setSending(true)

    let currentSessionId = sessionId

    try {
      if (!currentSessionId) {
        currentSessionId = await ensureSessionId({
          prompt: params.prompt,
          files: params.files,
        })
      }

      const reply = await sendImageSessionMessage({
        sessionId: currentSessionId,
        prompt: params.prompt,
        files: params.files,
      })

      const assistantMessage: ImageChatMessage = {
        id: makeId(),
        role: 'assistant',
        text: reply.text || '已收到请求，图片生成中。',
        images: reply.images,
        createdAt: Date.now(),
        status: 'ok',
      }

      const finalMessages = [...nextMessages, assistantMessage]
      setMessages(finalMessages)

      try {
        const remote = await fetchLatestSessionHistory(10)
        const mapped = mapBackendHistory(remote)
          .sort((a, b) => b.updatedAt - a.updatedAt)
          .slice(0, 10)
        setHistorySessions(mapped)
      } catch {
        setHistorySessions([])
      }
    } catch (error) {
      const errText = error instanceof Error ? error.message : '发送失败'
      const failedMessage: ImageChatMessage = {
        id: makeId(),
        role: 'assistant',
        text: errText,
        images: [],
        createdAt: Date.now(),
        status: 'error',
      }

      const finalMessages = [...nextMessages, failedMessage]
      setMessages(finalMessages)
      throw error
    } finally {
      setSending(false)
    }
  }

  const closeCurrentSession = () => {
    setSessionId(null)
    setMessages([])
  }

  const openSessionFromHistory = (targetSessionId: string) => {
    const target = historySessions.find((item) => item.sessionId === targetSessionId)
    if (!target) {
      return
    }

    setSessionId(target.sessionId)
    setMessages(target.messages)
  }

  const clearSession = () => {
    closeCurrentSession()
  }

  const value = useMemo(
    () => ({
      sessionId,
      messages,
      sending,
      historySessions,
      sendMessage,
      openSessionFromHistory,
      closeCurrentSession,
      clearSession,
    }),
    [sessionId, messages, sending, historySessions]
  )

  return <ImageSessionContext.Provider value={value}>{children}</ImageSessionContext.Provider>
}

export const useImageSession = () => useContext(ImageSessionContext)

