import ImageChat from './chat'
import styles from './index.module.scss'
import ImageShow from './show'

export default function ImagePanel() {
    return (
        <div className={styles.body}>
            <ImageChat />
            <ImageShow />
        </div>
    )
}