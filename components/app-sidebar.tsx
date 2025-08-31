"use client";

import * as React from "react";
import {
  IconHome,
  IconUsers,
  IconUserCheck,
  IconSchool,
  IconLicense,
  IconFileText,
  IconBell,
  IconBriefcase,
  IconCar,
  IconTrafficLights,
  IconBook,
  IconTools,
  IconChartBar,
  IconTestPipe,
  IconTrendingUp,
  IconBuilding,
  IconWorld,
  IconCreditCard,
  IconClipboardText,
  IconFileAnalytics,
  IconSettings,
  IconHelp,
  IconSearch,
  IconDashboard,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Conduzili",
    email: "admin@conduzili.com",
    avatar: "C",
  },
  navMain: [
    {
      title: "Início",
      url: "/dashboard",
      icon: IconHome,
    },
  ],
  escola: [
    {
      title: "Alunos",
      url: "/dashboard/students",
      icon: IconUsers,
    },
    {
      title: "Instrutores",
      url: "/dashboard/instructors",
      icon: IconUserCheck,
    },
    {
      title: "Turmas",
      url: "/dashboard/classes",
      icon: IconSchool,
    },
    {
      title: "Categorias de Carta",
      url: "/dashboard/license-categories",
      icon: IconLicense,
    },
    {
      title: "Exames",
      url: "/dashboard/exams",
      icon: IconFileText,
    },
    {
      title: "Avisos",
      url: "/dashboard/notices",
      icon: IconBell,
    },
    {
      title: "Funcionários",
      url: "/dashboard/employees",
      icon: IconBriefcase,
    },
    {
      title: "Veículos",
      url: "/dashboard/vehicles",
      icon: IconCar,
    },
  ],
  aulas: [
    {
      title: "Sinais de Trânsito",
      url: "/dashboard/traffic-signs",
      icon: IconTrafficLights,
    },
    {
      title: "Regras de Trânsito",
      url: "/dashboard/traffic-rules",
      icon: IconBook,
    },
    {
      title: "Mecânica",
      url: "/dashboard/mechanics",
      icon: IconTools,
    },
  ],
  desempenho: [
    {
      title: "Estatísticas",
      url: "/dashboard/performance",
      icon: IconChartBar,
    },
    {
      title: "Testes",
      url: "/dashboard/student-tests",
      icon: IconTestPipe,
    },
    {
      title: "Progresso do Aluno",
      url: "/dashboard/student-progress",
      icon: IconTrendingUp,
    },
  ],
  sistema: [
    {
      title: "Escolas",
      url: "/dashboard/schools",
      icon: IconBuilding,
    },
    {
      title: "Conteúdo Global",
      url: "/dashboard/content",
      icon: IconWorld,
    },
    {
      title: "Gerir Assinaturas",
      url: "/dashboard/subscription-plans",
      icon: IconCreditCard,
    },
    {
      title: "Simulados",
      url: "/dashboard/tests",
      icon: IconClipboardText,
    },
    {
      title: "Pagamentos",
      url: "/dashboard/payments",
      icon: IconCreditCard,
    },
    {
      title: "Relatórios",
      url: "/dashboard/reports",
      icon: IconFileAnalytics,
    },
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ],
  navSecondary: [
    {
      title: "Configurações",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Ajuda",
      url: "/dashboard/help",
      icon: IconHelp,
    },
    {
      title: "Pesquisar",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header Fixo - Sempre visível */}
      <SidebarHeader className="sticky top-0 z-10 bg-sidebar border-b border-sidebar-border shadow-sm">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard" className="cursor-pointer">
                <IconDashboard className="!size-8" />
                <span className="text-base font-semibold">
                  Conduzili
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      {/* Conteúdo com Scroll Moderno - Customizado para permitir scroll quando colapsado */}
      <div 
        data-slot="sidebar-content"
        data-sidebar="content"
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-sidebar-border hover:scrollbar-thumb-sidebar-ring transition-all duration-200"
      >
        <div className="px-3 py-2">
          <NavMain items={data.navMain} />
        </div>
        
        {/* Seção ESCOLA */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            ESCOLA
          </h3>
          <NavMain items={data.escola} />
        </div>

        {/* Seção AULAS */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            AULAS
          </h3>
          <NavMain items={data.aulas} />
        </div>

        {/* Seção DESEMPENHO */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            DESEMPENHO
          </h3>
          <NavMain items={data.desempenho} />
        </div>

        {/* Seção SISTEMA */}
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            SISTEMA
          </h3>
          <NavMain items={data.sistema} />
        </div>

        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </div>
      
      {/* Footer Fixo - Sempre visível */}
      <SidebarFooter className="sticky bottom-0 z-10 bg-sidebar border-t border-sidebar-border shadow-sm">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
