import { Modal } from 'antd'
import type { AuthMode } from '../pages/home/components/context'

type RequireLoginOptions = {
  isLoggedIn: boolean
  openAuthModal: (mode?: AuthMode) => void
  title?: string
  content?: string
}

export function requireLogin(options: RequireLoginOptions): boolean {
  if (options.isLoggedIn) {
    return true
  }

  Modal.confirm({
    title: options.title ?? '请先登录',
    content:
      options.content ?? '当前操作需要登录后继续，是否现在去登录？',
    okText: '去登录',
    cancelText: '取消',
    onOk: () => {
      options.openAuthModal('login')
    },
  })

  return false
}
