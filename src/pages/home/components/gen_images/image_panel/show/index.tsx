import { AliwangwangOutlined, CaretDownOutlined, CloseOutlined, CopyOutlined, DownloadOutlined, MoreOutlined, ShareAltOutlined, PictureOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { Upload, Button, message } from 'antd'
import type { UploadProps } from 'antd';
import { useState, useEffect } from 'react'
import styles from './index.module.scss'

const { Dragger } = Upload;

export default function ImageShow() {

    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const uploadProps: UploadProps = {
        name: 'file',
        multiple: false,
        showUploadList: false,
        accept: '.png,.jpg,.jpeg',
        beforeUpload(file) {
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('Image must be smaller than 10MB!');
                return Upload.LIST_IGNORE;
            }
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                setImageUrl(reader.result as string);
            };
            return false;
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
    };

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (items) {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].type.indexOf('image') !== -1) {
                        const blob = items[i].getAsFile();
                        if (blob) {
                            if (blob.size / 1024 / 1024 > 10) {
                                message.error('Image must be smaller than 10MB!');
                                return;
                            }
                            const reader = new FileReader();
                            reader.readAsDataURL(blob);
                            reader.onload = () => {
                                setImageUrl(reader.result as string);
                            };
                        }
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, []);

    const list = [
        {
            title: '真实风',
            icon: <AliwangwangOutlined />,
        },
        {
            title: '动漫风',
            icon: <AliwangwangOutlined />,
        },
        {
            title: '油画风',
            icon: <AliwangwangOutlined />,
        },
        {
            title: '素描风',
            icon: <AliwangwangOutlined />,
        },
        {
            title: '水彩风',
            icon: <AliwangwangOutlined />,
        },
    ]

    const btnlist = [
        {
            title: '下载',
            icon: <DownloadOutlined />,
        },
        {
            title: '复制',
            icon: <CopyOutlined />,
        },
        {
            title: '分享',
            icon: <ShareAltOutlined />,
        },
        {
            title: null,
            icon: <CloseOutlined />,
        }
    ]

    return (
        <div className={styles.body}>
            <div className={styles.head}>
                <div className={styles.left}>
                    {
                        list.map(item => (
                            <div className={styles.item}>
                                <div className={styles.icon}>{item.icon}</div>
                                <div className={styles.title}>{item.title}</div>
                            </div>
                        ))
                    }
                    <div className={styles.item_end}>
                        <div className={styles.icon}>更多</div>
                        <div className={styles.title}><CaretDownOutlined /></div>
                    </div>
                </div>
                <div className={styles.right}>
                    {
                        btnlist.map(item => (
                            <div className={styles.item}>
                                <div className={styles.icon}>{item.icon}</div>
                                {item.title && <div className={styles.title}>{item.title}</div>}
                            </div>
                        ))
                    }
                </div>
            </div>
            <div className={styles.content}>
                {imageUrl ? (
                    <div className={styles.image_preview}>
                        <img src={imageUrl} alt="uploaded" />
                        <div className={styles.remove_btn} onClick={() => setImageUrl(null)}>
                            <CloseOutlined />
                        </div>
                    </div>
                ) : (
                    <Upload {...uploadProps}>
                        <div className={styles.upload_area}>
                            <div className={styles.icon}>
                                <PictureOutlined style={{ fontSize: '64px', color: '#e0e0e0' }} />
                            </div>
                            <div className={styles.text}>
                                <div>
                                    <span style={{ color: '#4d7cfe', cursor: 'pointer' }}>支持拖拽</span>、<span style={{ color: '#4d7cfe', cursor: 'pointer' }}>Ctrl+V</span> 粘贴图片至此
                                </div>
                            </div>
                            <div className={styles.hint}>
                                图片最大10M PNG、JPG格式
                            </div>
                            <Button type="primary" shape="round" icon={<PlusCircleOutlined />} size="large" style={{ backgroundColor: '#f0f2f5', color: '#333', border: 'none' }}>
                                上传图片
                            </Button>
                        </div>
                    </Upload>
                )}
            </div>
        </div>
    )
}