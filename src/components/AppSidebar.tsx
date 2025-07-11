import { useState } from "react"
import { 
  BarChart3, 
  Globe, 
  FileText, 
  Settings, 
  Brain, 
  Radio,
  Home,
  Database,
  Send
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"

const menuItems = [
  { title: "Панель управления", url: "/", icon: Home },
  { title: "Аналитика", url: "/analytics", icon: BarChart3 },
  { title: "Источники", url: "/sources", icon: Globe },
  { title: "Новости", url: "/news", icon: FileText },
  { title: "Публикации", url: "/publications", icon: Send },
  { title: "ИИ настройки", url: "/ai-settings", icon: Brain },
  { title: "Настройки", url: "/settings", icon: Settings },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const collapsed = state === "collapsed"

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-gradient rounded-lg flex items-center justify-center">
            <Radio className="w-5 h-5 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold text-foreground">NewsBot</h2>
              <p className="text-xs text-muted-foreground">Управление новостями</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Навигация</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive(item.url)}
                    className="transition-colors"
                  >
                    <NavLink to={item.url} end>
                      <item.icon className="w-4 h-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}