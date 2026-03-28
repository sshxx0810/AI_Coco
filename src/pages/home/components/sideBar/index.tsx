import { Button, ConfigProvider, Layout, Menu, Tooltip } from 'antd'
import {
  DoubleLeftOutlined,
  DoubleRightOutlined,
  FolderOpenOutlined,
  LogoutOutlined,
  PictureOutlined,
  RobotOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo } from 'react'
import styles from './index.module.scss'
import logo from '../../assets/logo.jpeg'
import test_avatar from '../../assets/test_avatar.png'
import { useSidebar } from '../context'
import { logout } from '../../../../api/userApi'
import { useImageSession } from '../gen_images/context'

const { Sider } = Layout

const AVATAR_BASE_URL = import.meta.env.VITE_BASE_URL || 'http://127.0.0.1:3000'

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isMobile = window.innerWidth < 768

  const { collapsed, setCollapsed, isLoggedIn, setIsLoggedIn, setUser } = useSidebar()
  const { sessionId, historySessions, closeCurrentSession, openSessionFromHistory } = useImageSession()

  const handleLogout = () => {
    logout()
    localStorage.removeItem('auth_username')
    localStorage.removeItem('auth_avatar')
    localStorage.removeItem('auth_useremail')
    setIsLoggedIn(false)
    setUser({
      username: '未登录用户',
      email: '',
      status: '请先登录',
      avatar: '',
    })
  }

  const items = [
    {
      key: 'button',
      icon: <DoubleRightOutlined />,
      style: { display: collapsed ? 'block' : 'none', backgroundColor: 'transparent', border: 'none' },
    },
    {
      key: 'ai-chat',
      icon: <RobotOutlined />,
      label: 'AI Chat',
      navigate: '/app/chat',
    },
    {
      key: 'messages',
      icon: <PictureOutlined />,
      label: 'AI 生图',
      navigate: '/app/image',
    },
    {
      key: 'library',
      icon: <FolderOpenOutlined />,
      label: '知识库',
      navigate: '/app/library',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
      navigate: '/app/settings',
    },
  ]

  const selectedKeys = useMemo(() => {
    const item = items.find((entry) => pathname === entry.navigate)
    return item ? [item.key] : []
  }, [pathname])

  const historyItems = useMemo(() => historySessions.slice(0, 10), [historySessions])

  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: 'rgba(20, 20, 20, 1)',
          controlItemBgHover: 'rgba(173, 157, 247, 0.5)',
          controlItemBgActive: 'rgba(173, 157, 247, 0.5)',
          colorPrimary: '#4001a7ff',
        },
      }}
    >
      <Sider
        width={isMobile ? '100%' : 200}
        className={`${styles.sider} ${collapsed ? styles.collapsed : ''}`}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
      >
        <div className={styles.head}>
          <div className={styles.logo}>
            <img className={styles.logoImg} src={logo} alt="logo" />
            <span>灵绘</span>
          </div>
          <div className={styles.logoCollapsed}>
            <img src={logo} alt="logo" width={35} height={35} />
          </div>
          <div className={styles.trigger} onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? null : <DoubleLeftOutlined />}
          </div>
        </div>

        <div className={styles.menuTitle} style={{ display: collapsed ? 'none' : 'block' }}>
          通用功能
        </div>

        <Menu
          className={styles.menu}
          mode="inline"
          selectedKeys={selectedKeys}
          items={items}
          inlineCollapsed={collapsed}
          onClick={({ key }) => {
            const item = items.find((entry) => entry.key === key)
            if (item?.key === 'button') {
              setCollapsed(!collapsed)
              return
            }

            if (item?.key === 'messages') {
              closeCurrentSession()
            }

            if (item?.navigate) {
              navigate(item.navigate)
            }
          }}
        />

        <div className={styles.menuTitle} style={{ display: collapsed ? 'none' : 'block' }}>
          历史记录
        </div>

        {!collapsed && (
          <div className={styles.historyList}>
            {historyItems.length === 0 && <div className={styles.historyEmpty}>暂无会话记录</div>}

            {historyItems.map((item) => (
              <button
                type="button"
                key={item.sessionId}
                title={item.title}
                className={`${styles.historyItem} ${
                  sessionId === item.sessionId ? styles.historyItemActive : ''
                }`}
                onClick={() => {
                  openSessionFromHistory(item.sessionId)
                  navigate('/app/imagepanel')
                }}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1 }} />

        <User collapsed={collapsed} />

        <Tooltip title={isLoggedIn ? '退出登录' : '当前未登录'}>
          <Button
            danger
            disabled={!isLoggedIn}
            className={`${styles.logoutButton} ${collapsed ? styles.logoutButtonCollapsed : ''}`}
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            {collapsed ? '' : '退出登录'}
          </Button>
        </Tooltip>
      </Sider>
    </ConfigProvider>
  )
}

function User({ collapsed }: { collapsed: boolean }) {
  const { user } = useSidebar()

  const avatarUrl = user.avatar
    ? `${AVATAR_BASE_URL}${user.avatar.startsWith('/') ? '' : '/'}${user.avatar}`
    : test_avatar

  return (
    <div className={`${styles.user} ${collapsed ? styles.userr : ''}`}>
      <img className={styles.userImg} src={avatarUrl} alt="user avatar" />
      <div className={styles.userInfo}>
        <div className={styles.userName}>{user.username}</div>
        <div className={styles.userEmail}>{user.status}</div>
      </div>
    </div>
  )
}
