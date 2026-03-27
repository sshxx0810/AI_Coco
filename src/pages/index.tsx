import { Button, Form, Input, Layout, Modal, Space, Upload, message } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { useEffect, useState } from 'react'
import Sidebar from './home/components/sideBar'
import styles from './index.module.scss'
import { Outlet } from 'react-router-dom'
import { SidebarProvider, useSidebar } from './home/components/context'
import { createUser, login } from '../api/userApi'

type AuthFormValues = {
  username: string
  password: string
  avatar?: UploadFile[]
  email?: string
  bio?: string
}

const defaultType = 'user'

export default function MainPage() {
  return (
    <SidebarProvider>
      <MainPageContent />
    </SidebarProvider>
  )
}

function MainPageContent() {
  const [form] = Form.useForm<AuthFormValues>()
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()

  const {
    isLoggedIn,
    setIsLoggedIn,
    setUser,
    authModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    openAuthModal,
  } = useSidebar()

  useEffect(() => {
    if (authModalOpen) {
      form.resetFields()
    }
  }, [authModalOpen, authMode, form])

  const handleLogin = async (values: AuthFormValues) => {
    setSubmitting(true)
    try {
      const res = await login(values.username, values.password)
      const username = res.data?.username || values.username
      const avatar = res.data?.avatar || ''
      const email = res.data?.email || ''

      localStorage.setItem('auth_username', username)
      localStorage.setItem('auth_avatar', avatar)
      localStorage.setItem('auth_useremail', email)

      setUser({
        username,
        email,
        status: '已登录',
        avatar,
      })

      setIsLoggedIn(true)
      messageApi.success('登录成功')
      setAuthModalOpen(false)
      form.resetFields()
    } catch (error) {
      let errMsg = error instanceof Error ? error.message : '登录失败'
      if (errMsg === '请求的资源不存在') {
        errMsg = '用户不存在'
      }
      messageApi.error(errMsg, 3)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRegister = async (values: AuthFormValues) => {
    setSubmitting(true)
    try {
      const avatarFile = values.avatar?.[0]?.originFileObj as File | undefined
      if (!avatarFile) {
        messageApi.error('请上传头像', 3)
        return
      }

      await createUser({
        username: values.username,
        password: values.password,
        avatar: avatarFile,
        email: values.email || '',
        bio: values.bio || '',
        type: defaultType,
      })

      messageApi.success('注册成功，请登录', 3)
      setAuthMode('login')
      form.setFieldsValue({
        username: values.username,
        password: '',
        avatar: [],
        email: '',
        bio: '',
      })
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : '注册失败'
      messageApi.error(errMsg, 3)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Layout className={styles.layout}>
      {contextHolder}
      <Sidebar />
      <Outlet />

      {!isLoggedIn && (
        <Space className={styles.authActions} size={10}>
          <Button type="primary" onClick={() => openAuthModal('login')}>
            登录
          </Button>
          <Button onClick={() => openAuthModal('register')}>注册</Button>
        </Space>
      )}

      <Modal
        title={authMode === 'login' ? '登录' : '注册'}
        open={authModalOpen}
        onCancel={() => setAuthModalOpen(false)}
        destroyOnClose
        footer={null}
      >
        <Form<AuthFormValues>
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={authMode === 'login' ? handleLogin : handleRegister}
        >
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, message: '用户名至少 3 个字符' },
            ]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 个字符' },
            ]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          {authMode === 'register' && (
            <>
              <Form.Item
                label="头像"
                name="avatar"
                valuePropName="fileList"
                getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
                rules={[{ required: true, message: '请上传头像' }]}
              >
                <Upload beforeUpload={() => false} maxCount={1} accept="image/*" listType="picture">
                  <Button>选择本地头像</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                label="邮箱"
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '邮箱格式不正确' },
                ]}
              >
                <Input placeholder="请输入邮箱" />
              </Form.Item>

              <Form.Item
                label="个人介绍"
                name="bio"
                rules={[
                  { max: 300, message: '个人介绍最多 300 个字符' },
                ]}
              >
                <Input.TextArea placeholder="介绍一下你自己" rows={3} />
              </Form.Item>
            </>
          )}

          <Space size={12}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {authMode === 'login' ? '登录' : '注册'}
            </Button>
          </Space>
        </Form>
      </Modal>
    </Layout>
  )
}
