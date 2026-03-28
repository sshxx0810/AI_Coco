import { Button, Upload, type UploadFile } from 'antd'
import { SendOutlined, PictureOutlined, FileOutlined } from '@ant-design/icons'
import styles from './index.module.scss'
import { useState } from 'react'

export default function ChatInputBar() {

    const [imgList, setImgList] = useState<UploadFile[]>([])
    const [fileList, setFileList] = useState<UploadFile[]>([])

    const handleImgClick = (file: UploadFile) => {
        const viewer = document.createElement('img');
        viewer.src = file.thumbUrl || URL.createObjectURL(file.originFileObj!);
        viewer.style.position = 'fixed';
        viewer.style.top = '0';
        viewer.style.left = '0';
        viewer.style.width = '100%';
        viewer.style.height = '100%';
        viewer.style.objectFit = 'contain';
        viewer.style.backgroundColor = 'rgba(0,0,0,0.8)';
        viewer.style.zIndex = '1';
        viewer.style.cursor = 'zoom-out';
        viewer.onclick = () => document.body.removeChild(viewer);
        document.body.appendChild(viewer);
    }

    const handleRemove = (uid: string) => {
        setImgList(imgList.filter(f => f.uid !== uid));
    }

    return (
        <div className={styles.bar}>
            {imgList.length > 0 && (
                <div className={styles.previewRow}>
                    {imgList.map((file) => (
                        <div key={file.uid} className={styles.previewImg}>
                            <img
                                key={file.uid}
                                src={file.thumbUrl || URL.createObjectURL(file.originFileObj!)}
                                alt="preview"
                                width={40}
                                height={40}
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleImgClick(file)}
                            />
                            <span
                                className={styles.removeBtn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(file.uid);
                                }}
                            >
                                ×
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <textarea className={styles.textArea} placeholder="输入内容..." />

            {/* 上传图片：PC端点击、移动端支持相机/相册 */}
            <div className={styles.buttons}>
                <div className={styles.uploadBtns}>
                    <Upload
                        beforeUpload={() => false}
                        showUploadList={false}
                        accept="image/*"
                        onChange={(info) => setImgList(info.fileList)}
                        fileList={imgList}
                    >
                        <div className={styles.btn}>
                            < PictureOutlined className={styles.icon} />
                            <span>上传图片</span>
                        </div>
                    </Upload>
                    <Upload
                        beforeUpload={() => false}
                        showUploadList={false}
                        accept="image/*"
                        onChange={(info) => setFileList(info.fileList)}
                        fileList={fileList}
                    >
                        <div className={styles.btn}>
                            < FileOutlined className={styles.icon} />
                            <span>上传文件</span>
                        </div>                    </Upload>
                </div>
                <Button type="primary" icon={<SendOutlined />} style={{ outline: 'none' }} />
            </div>
        </div>
    )
}
