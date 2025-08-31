"use client"

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react"
import Link from "next/link"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthContext } from "@/components/providers/auth-provider"

export function NavUser() {
  const { isMobile } = useSidebar()
  const { user, profile, signOut } = useAuthContext()

  // Se não houver usuário autenticado, não renderizar nada
  if (!user) {
    return null
  }

  const handleLogout = async () => {
    await signOut()
  }

  // Obter dados do perfil do usuário
  const userName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'
  const userEmail = profile?.email || user.email || 'sem-email@exemplo.com'
  const userAvatar = profile?.avatar_url || user.user_metadata?.avatar_url || null
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-10 w-10 rounded-lg">
                <AvatarImage src={userAvatar || undefined} alt={userName} />
                <AvatarFallback className="rounded-lg bg-blue-600 text-white font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{userName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {userEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-5" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-10 w-10 rounded-lg">
                  <AvatarImage src={userAvatar || undefined} alt={userName} />
                  <AvatarFallback className="rounded-lg bg-blue-600 text-white font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{userName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {userEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                  <IconUserCircle className="mr-2 h-8 w-8" />
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard className="mr-2 h-8 w-8" />
                Assinatura
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification className="mr-2 h-8 w-8" />
                Notificações
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <IconLogout className="mr-2 h-8 w-8" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
