import {
  CloseOutlined,
  DeleteOutlined,
  DownloadOutlined,
  ScanOutlined,
  TrademarkOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Empty, message } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import styles from './index.module.scss'
import { useImageSession } from '../../context'

type ImageShowProps = {
  selectedImage: string | null
  onImageSelect: (image: string | null) => void
}

export default function ImageShow({ selectedImage, onImageSelect }: ImageShowProps) {
  const { messages } = useImageSession()
  const [closed, setClosed] = useState(false)

  const assistantImages = useMemo(
    () => messages.filter((item) => item.role === 'assistant').flatMap((item) => item.images),
    [messages]
  )

  const latestImage = assistantImages[assistantImages.length - 1] || null
  const displayImage = selectedImage || latestImage
  const hasImage = Boolean(displayImage) && !closed

  useEffect(() => {
    if (displayImage) {
      setClosed(false)
    }
  }, [displayImage])

  const ensureImageReady = () => {
    if (!displayImage || closed) {
      message.warning('暂无可操作的图片')
      return false
    }
    return true
  }

  const handlePendingAction = (label: string) => {
    if (!ensureImageReady()) {
      return
    }
    message.info(`${label} 功能开发中`)
  }

  const handleDownload = () => {
    if (!ensureImageReady() || !displayImage) {
      return
    }

    const link = document.createElement('a')
    link.href = displayImage
    link.download = `generated-${Date.now()}.png`
    link.target = '_blank'
    link.rel = 'noopener'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleClose = () => {
    setClosed(true)
    onImageSelect(null)
  }

  return (
    <div className={styles.body}>
      <div className={styles.head}>
        <div className={styles.left}>
          <div className={styles.item} onClick={() => handlePendingAction('变清晰')}>
            <span className={styles.icon}>
              <ScanOutlined />
            </span>
            <span className={styles.title}>变清晰</span>
          </div>
          <div className={styles.item} onClick={() => handlePendingAction('去水印')}>
            <span className={styles.icon}>
              <TrademarkOutlined />
            </span>
            <span className={styles.title}>去水印</span>
          </div>
          <div className={styles.item} onClick={() => handlePendingAction('消除')}>
            <span className={styles.icon}>
              <DeleteOutlined />
            </span>
            <span className={styles.title}>消除</span>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.item} onClick={handleDownload}>
            <span className={styles.icon}>
              <DownloadOutlined />
            </span>
            <span className={styles.title}>下载</span>
          </div>
          <div className={styles.item} onClick={() => handlePendingAction('变视频')}>
            <span className={styles.icon}>
              <VideoCameraOutlined />
            </span>
            <span className={styles.title}>变视频</span>
          </div>
          <div className={styles.item} onClick={handleClose}>
            <span className={styles.icon}>
              <CloseOutlined />
            </span>
            <span className={styles.title}>关闭</span>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        {hasImage && displayImage ? (
          <div className={styles.image_preview}>
            <img src={displayImage} alt="generated" />
          </div>
        ) : (
          <Empty description="暂无生成结果，先在左侧发送一条消息" />
        )}
      </div>
    </div>
  )
}
