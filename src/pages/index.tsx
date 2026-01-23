import { Layout } from 'antd'
import Sidebar from './home/components/sideBar'
import styles from './index.module.scss'
import { Outlet } from 'react-router-dom'
import { SidebarProvider } from './home/components/context'

export default function MainPage() {
  return (
    <Layout className={styles.layout}>
      <SidebarProvider>
        <Sidebar />
        <Outlet />
      </SidebarProvider>
    </Layout>
  )
}
