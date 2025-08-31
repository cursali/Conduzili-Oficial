"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const pathname = usePathname()

  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild
                  className={isActive ? "bg-blue-500 text-white hover:bg-blue-600" : ""}
                >
                  <a href={item.url} className="cursor-pointer">
                    {React.createElement(item.icon, {
                      className: "!w-6 !h-6 !min-w-6 !min-h-6 !bg-blue-500 !text-white !rounded-full !p-1.5 !text-[24px] !leading-[24px] !max-w-6 !max-h-6",
                      style: { 
                        width: '24px', 
                        height: '24px', 
                        minWidth: '24px', 
                        minHeight: '24px',
                        maxWidth: '24px',
                        maxHeight: '24px'
                      }
                    })}
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
