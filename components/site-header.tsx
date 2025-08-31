'use client'

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeSelector } from "./theme-selector";
import { ModeSwitcher } from "./mode-switcher";
import { useAuthContext } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { IconLogout, IconUser } from "@tabler/icons-react";

export function SiteHeader() {
  const { user, profile, signOut } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-20 flex h-(--header-height) shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          <ThemeSelector />
          <ModeSwitcher />
          
          {/* Informações do usuário */}
          {user && (
            <>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <IconUser className="w-4 h-4" />
                  <span className="hidden md:inline">
                    {profile?.name || user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="h-8 px-2"
                >
                  <IconLogout className="w-4 h-4" />
                  <span className="hidden md:inline ml-1">Sair</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
