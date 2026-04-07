import { useEffect, useRef, useState } from 'react'
import ImageInputBar from '../../ImageInput'
import styles from './index.module.scss'
import { useImageSession } from '../../context'

type ImageChatProps = {
  onImageSelect: (image: string) => void
}

type TypingState = {
  id: string | null
  text: string
}

export default function ImageChat({ onImageSelect }: ImageChatProps) {
  const { messages, sending } = useImageSession()
  const contentRef = useRef<HTMLDivElement | null>(null)
  const typingTimerRef = useRef<number | null>(null)
  const longWaitTimerRef = useRef<number | null>(null)
  const [typingState, setTypingState] = useState<TypingState>({
    id: null,
    text: '',
  })
  const [showLongWaitHint, setShowLongWaitHint] = useState(false)

  const clearTypingTimer = () => {
    if (typingTimerRef.current !== null) {
      window.clearInterval(typingTimerRef.current)
      typingTimerRef.current = null
    }
  }

  const clearLongWaitTimer = () => {
    if (longWaitTimerRef.current !== null) {
      window.clearTimeout(longWaitTimerRef.current)
      longWaitTimerRef.current = null
    }
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'auto') => {
    const container = contentRef.current
    if (!container) {
      return
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    })
  }

  useEffect(() => {
    const raf = requestAnimationFrame(() => scrollToBottom('smooth'))
    const timer = window.setTimeout(() => scrollToBottom('auto'), 120)

    return () => {
      cancelAnimationFrame(raf)
      window.clearTimeout(timer)
    }
  }, [messages, sending])

  useEffect(() => {
    return () => {
      clearTypingTimer()
      clearLongWaitTimer()
    }
  }, [])

  useEffect(() => {
    clearLongWaitTimer()
    if (!sending) {
      setShowLongWaitHint(false)
      return
    }

    setShowLongWaitHint(false)
    longWaitTimerRef.current = window.setTimeout(() => {
      setShowLongWaitHint(true)
    }, 30000)

    return () => {
      clearLongWaitTimer()
    }
  }, [sending])

  useEffect(() => {
    const latestMessage = messages[messages.length - 1]
    if (!latestMessage || latestMessage.role !== 'assistant' || !latestMessage.text) {
      clearTypingTimer()
      setTypingState({ id: null, text: '' })
      return
    }

    const shouldAnimateTyping =
      latestMessage.status !== 'error' && Date.now() - latestMessage.createdAt < 15000

    if (!shouldAnimateTyping) {
      clearTypingTimer()
      setTypingState({ id: latestMessage.id, text: latestMessage.text })
      return
    }

    clearTypingTimer()
    let cursor = 0
    const step = latestMessage.text.length > 100 ? 3 : 2
    setTypingState({ id: latestMessage.id, text: '' })

    typingTimerRef.current = window.setInterval(() => {
      cursor = Math.min(cursor + step, latestMessage.text.length)
      setTypingState({
        id: latestMessage.id,
        text: latestMessage.text.slice(0, cursor),
      })
      scrollToBottom('auto')

      if (cursor >= latestMessage.text.length) {
        clearTypingTimer()
      }
    }, 24)
  }, [messages])

  useEffect(() => {
    if (showLongWaitHint) {
      scrollToBottom('smooth')
    }
  }, [showLongWaitHint])

  return (
    <div className={styles.body}>
      <div className={styles.content} ref={contentRef}>
        {messages.length === 0 && <div className={styles.empty}>开始描述你的需求，发起第一条生成消息</div>}

        {messages.map((item) => {
          const isTypingMessage = typingState.id === item.id
          const renderText = isTypingMessage ? typingState.text : item.text
          const showCursor = isTypingMessage && typingState.text.length < item.text.length

          return (
            <div
              key={item.id}
              className={`${styles.message} ${item.role === 'user' ? styles.user : styles.assistant}`}
            >
              {item.text && (
                <div className={`${styles.text} ${isTypingMessage ? styles.typingText : ''}`}>
                  {renderText}
                  {showCursor && <span className={styles.cursor} aria-hidden="true" />}
                </div>
              )}
              {item.images.length > 0 && (
                <div className={styles.images}>
                  {item.images.map((src, idx) => (
                    <img
                      key={`${item.id}-${idx}`}
                      src={src}
                      alt="preview"
                      onLoad={() => scrollToBottom('auto')}
                      onClick={() => onImageSelect(src)}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        {sending && (
          <div className={styles.status} role="status" aria-live="polite">
            <span className={styles.loadingText}>正在生成，请稍候...</span>
            {showLongWaitHint && (
              <span className={styles.longWaitText}>灵绘正在努力生成中，请耐心等待...</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.inputBar}>
        <ImageInputBar />
      </div>
    </div>
  )
}
