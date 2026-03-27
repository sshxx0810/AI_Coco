import { ConfigProvider, Dropdown, Upload, type UploadFile } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { useState } from 'react'
import styles from './index.module.scss'
import upload_image from '../../../assets/upload_image.svg'
import imgsize from '../../../assets/size.svg'
import picture_resolution from '../../../assets/picture_resolution.svg'
import _4_3 from '../assets/4.3.svg'
import _1_1 from '../assets/1.1.svg'
import _3_4 from '../assets/3.4.svg'
import _9_16 from '../assets/9.16.svg'
import _2_3 from '../assets/2.3.svg'
import { useNavigate } from 'react-router-dom'
import { useSidebar } from '../../context'
import { requireLogin } from '../../../../../middleware/requireLogin'

export default function ImageInputBar() {
    const navigate = useNavigate()
    const { setCollapsed, isLoggedIn, openAuthModal } = useSidebar()

    const [imgList, setImgList] = useState<UploadFile[]>([])
    const [resolution, setResolution] = useState('720P')
    const [size, setSize] = useState('16 : 9')

    const handleImgClick = (file: UploadFile) => {
        const viewer = document.createElement('img')
        viewer.src = file.thumbUrl || URL.createObjectURL(file.originFileObj!)
        viewer.style.position = 'fixed'
        viewer.style.top = '0'
        viewer.style.left = '0'
        viewer.style.width = '100%'
        viewer.style.height = '100%'
        viewer.style.objectFit = 'contain'
        viewer.style.backgroundColor = 'rgba(0,0,0,0.8)'
        viewer.style.zIndex = '1'
        viewer.style.cursor = 'zoom-out'
        viewer.onclick = () => document.body.removeChild(viewer)
        document.body.appendChild(viewer)
    }

    const handleRemove = (uid: string) => {
        setImgList(imgList.filter((f) => f.uid !== uid))
    }

    const menuItems = [
        { key: '1:1', label: '1 : 1', icon: <img className={styles.icon} width={24} height={24} src={_1_1} alt="" /> },
        { key: '2:3', label: '2 : 3', icon: <img className={styles.icon} width={24} height={24} src={_2_3} alt="" /> },
        { key: '3:4', label: '3 : 4', icon: <img className={styles.icon} width={24} height={24} src={_3_4} alt="" /> },
        { key: '4:3', label: '4 : 3', icon: <img className={styles.icon} width={24} height={24} src={_4_3} alt="" /> },
        { key: '9:16', label: '9 : 16', icon: <img className={styles.icon} width={24} height={24} src={_9_16} alt="" /> },
    ]

    const handleSendClick = () => {
        const canContinue = requireLogin({
            isLoggedIn,
            openAuthModal,
            title: '请先登录',
            content: '生成图片前需要先登录，是否现在去登录？',
        })

        if (!canContinue) {
            return
        }

        setCollapsed(true)
        navigate('/app/imagepanel')
    }

    return (
        <>
            <div className={styles.bar}>
                <div className={styles.content}>
                    <Upload
                        className={styles.uploadbtn}
                        beforeUpload={() => false}
                        showUploadList={false}
                        accept="image/*"
                        onChange={(info) => setImgList(info.fileList)}
                        fileList={imgList}
                    >
                        <div className={styles.uploadcontent}>
                            <img className={styles.icon} src={upload_image} alt="" />
                        </div>
                    </Upload>

                    {imgList.length > 0 && (
                        <div className={styles.previewRow}>
                            {imgList.map((file) => (
                                <div key={file.uid} className={styles.previewImg}>
                                    <img
                                        src={file.thumbUrl || URL.createObjectURL(file.originFileObj!)}
                                        alt="preview"
                                        width={70}
                                        height={70}
                                        style={{ cursor: 'pointer', borderRadius: 8 }}
                                        onClick={() => handleImgClick(file)}
                                    />
                                    <span
                                        className={styles.removeBtn}
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            handleRemove(file.uid)
                                        }}
                                    >
                                        {'×'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    <textarea className={styles.textArea} placeholder={'描述你想要生成的图片...'} />
                </div>

                <div className={styles.buttons}>
                    <ConfigProvider
                        theme={{
                            token: {
                                controlItemBgHover: 'rgba(173, 157, 247, 0.5)',
                            },
                        }}
                    >
                        <div className={styles.imgBtn}>
                            <Dropdown
                                menu={{
                                    items: [
                                        { key: '720P', label: '720P' },
                                        { key: '1080P', label: '1080P' },
                                        { key: '2K', label: '2K' },
                                        { key: '4K', label: '4K' },
                                    ],
                                    onClick: ({ domEvent }) => {
                                        const label = (domEvent.target as HTMLElement).innerText
                                        setResolution(label)
                                    },
                                }}
                                trigger={['click']}
                            >
                                <div className={styles.imgArg}>
                                    <img className={styles.icon} src={picture_resolution} alt="" />
                                    {resolution}
                                </div>
                            </Dropdown>

                            <Dropdown
                                menu={{
                                    items: menuItems,
                                    onClick: ({ domEvent }) => {
                                        const label = (domEvent.target as HTMLElement).innerText
                                        setSize(label)
                                    },
                                }}
                                trigger={['click']}
                            >
                                <div className={styles.imgArg}>
                                    <img className={styles.icon} src={imgsize} alt="" />
                                    {size}
                                </div>
                            </Dropdown>
                        </div>
                    </ConfigProvider>

                    <div className={styles.sendBtn} onClick={handleSendClick}>
                        <SendOutlined />
                    </div>
                </div>
            </div>
        </>
    )
}
