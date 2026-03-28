import { useMemo, useState } from 'react'
import styles from './index.module.scss'
import ImageInputBar from './ImageInput'

export default function GenImages() {
  const [activeTab, setActiveTab] = useState('全部')

  const tabs = ['全部', '冬日氛围', '派对绝技', '我的多面人生', '社交媒体爆款', '微妙的恐怖', '宠物秀', '另类美学', '镜头切换']

  const cards = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => ({
        key: i,
        title: ['零基础自拍', '原始丛林惊魂', '时间魔流', '城市摄影风', '笔记本大屏自拍', '亲密', '电影胶片复兴', '肌肉涌动', '纹丝细节 Candid'][i % 9],
        cover: `https://picsum.photos/seed/${i + 10}/600/400`,
      })),
    []
  )

  return (
    <div className={styles.wrap}>
      <div className={styles.nav}>
        <div>
          {tabs.map((t) => (
            <div
              key={t}
              className={`${styles.tab} ${activeTab === t ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.grid}>
        {cards.map((c) => (
          <div key={c.key} className={styles.card}>
            <img className={styles.cover} src={c.cover} alt={c.title} />
            <div className={styles.badge}>{c.title}</div>
          </div>
        ))}
        <div className={styles.end}>没有更多了...</div>
      </div>

      <div className={styles.promptInner}>
        <ImageInputBar />
      </div>
    </div>
  )
}
