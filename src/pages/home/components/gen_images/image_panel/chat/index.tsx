import ImageInputBar from '../../ImageInput'
import styles from './index.module.scss'

export default function ImageChat() {
    return (
        <div className={styles.body}>
            <div className={styles.content}>

            </div>
            <div className={styles.inputBar}>
                <ImageInputBar />
            </div>
        </div>
    )
}
