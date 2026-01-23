import { useEffect, useRef, useState } from 'react'
import ChatInputBar from './ChatInput'
import styles from './index.module.scss'
import robot from '../../assets/robot.mp4'


export default function ChatFrame() {
    const inputRef = useRef<HTMLDivElement>(null)
    const [inputHeight, setInputHeight] = useState(0)

    useEffect(() => {
        const resetInputHeight = () => {
            console.log(inputRef.current?.offsetHeight)
            if (inputRef.current) {
                setInputHeight(inputRef.current.offsetHeight)
            }
        }
        resetInputHeight()
        const resizeObserver = new ResizeObserver(resetInputHeight)
        if (inputRef.current) {
            resizeObserver.observe(inputRef.current)
        }
        return () => {
            resizeObserver.disconnect()
            if (inputRef.current) {
                resizeObserver.unobserve(inputRef.current)
            }
        }
    }, [])

    return (
        <div className={styles.contentWrap}>
            <div className={styles.chatContent} style={{
                ["--input-height" as any]: `${inputHeight}px`,
            }}>
                <video
                    className={styles.robot}
                    src={robot}
                    autoPlay
                    loop
                    muted
                    playsInline
                    controls={false}
                />
                <div className={styles.user}>
                    你好，MOMO
                </div>
                <div className={styles.title}>今天需要我帮你做点什么吗？</div>
            </div>
            <div className={styles.inputBar} ref={inputRef}>
                <ChatInputBar />
            </div>
        </div>
    )
}
