import { useEffect, useMemo, useState } from 'react'
import ImageChat from './chat'
import styles from './index.module.scss'
import ImageShow from './show'
import { useImageSession } from '../context'

export default function ImagePanel() {
  const { messages } = useImageSession()
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const latestAssistantImage = useMemo(() => {
    const assistantImages = messages
      .filter((item) => item.role === 'assistant')
      .flatMap((item) => item.images)
    return assistantImages[assistantImages.length - 1] || null
  }, [messages])

  useEffect(() => {
    setSelectedImage(latestAssistantImage)
  }, [latestAssistantImage])

  const handleImageSelect = (image: string | null) => {
    setSelectedImage(image)
  }

  return (
    <div className={styles.body}>
      <ImageChat onImageSelect={handleImageSelect} />
      <ImageShow selectedImage={selectedImage} onImageSelect={handleImageSelect} />
    </div>
  )
}
