import { useEffect, useRef } from 'react'
import ImageInputBar from '../../ImageInput'
import styles from './index.module.scss'
import { useImageSession } from '../../context'

type ImageChatProps = {
  onImageSelect: (image: string) => void
}

export default function ImageChat({ onImageSelect }: ImageChatProps) {
  const { messages, sending } = useImageSession()
  const contentRef = useRef<HTMLDivElement | null>(null)

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

  return (
    <div className={styles.body}>
      <div className={styles.content} ref={contentRef}>
        {messages.length === 0 && <div className={styles.empty}>开始描述你的需求，发起第一条生成消息</div>}

        {messages.map((item) => (
          <div
            key={item.id}
            className={`${styles.message} ${item.role === 'user' ? styles.user : styles.assistant}`}
          >
            {item.text && <div className={styles.text}>{item.text}</div>}
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
        ))}

        {sending && <div className={styles.status}>正在生成，请稍候...</div>}
      </div>

      <div className={styles.inputBar}>
        <ImageInputBar />
      </div>
    </div>
  )
}
