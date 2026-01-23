import React, { createContext, useState, useContext } from 'react';

// 1. 创建 Context 对象f
interface SidebarContextType {
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}
const SidebarContext = createContext<SidebarContextType>({
    collapsed: true,
    setCollapsed: () => { },
});

// 2. 创建 Provider 组件
export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const isMobile = window.innerWidth < 768
    const [collapsed, setCollapsed] = useState(isMobile);

    return (
        <SidebarContext.Provider value={{ collapsed, setCollapsed } as any}>
            {children}
        </SidebarContext.Provider>
    );
};

// 3. 自定义 Hook 方便子组件调用
export const useSidebar = () => useContext(SidebarContext);