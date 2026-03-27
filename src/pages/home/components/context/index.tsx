import React, { createContext, useContext, useState } from 'react'

export type AuthMode = 'login' | 'register'

type SidebarUser = {
  username: string
  email: string
  status: string
  avatar: string
}

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  isLoggedIn: boolean
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>
  user: SidebarUser
  setUser: React.Dispatch<React.SetStateAction<SidebarUser>>
  authModalOpen: boolean
  setAuthModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  authMode: AuthMode
  setAuthMode: React.Dispatch<React.SetStateAction<AuthMode>>
  openAuthModal: (mode?: AuthMode) => void
}

const defaultUser: SidebarUser = {
  username: '未登录用户',
  email: '',
  status: '请先登录',
  avatar: '',
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: true,
  setCollapsed: () => undefined,
  isLoggedIn: false,
  setIsLoggedIn: () => undefined,
  user: defaultUser,
  setUser: () => undefined,
  authModalOpen: false,
  setAuthModalOpen: () => undefined,
  authMode: 'login',
  setAuthMode: () => undefined,
  openAuthModal: () => undefined,
})

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = window.innerWidth < 768
  const [collapsed, setCollapsed] = useState(isMobile)
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('auth_token')))
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const [user, setUser] = useState<SidebarUser>(() => {
    const username = localStorage.getItem('auth_username')
    const email = localStorage.getItem('auth_useremail') || ''
    const avatar = localStorage.getItem('auth_avatar') || ''

    if (!username) {
      return defaultUser
    }

    return {
      username,
      email,
      status: '已登录',
      avatar,
    }
  })

  const openAuthModal = (mode: AuthMode = 'login') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <SidebarContext.Provider
      value={{
        collapsed,
        setCollapsed,
        isLoggedIn,
        setIsLoggedIn,
        user,
        setUser,
        authModalOpen,
        setAuthModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
