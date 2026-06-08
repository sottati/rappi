'use client'

import {
  Analytics01Icon,
  DashboardSquare01Icon,
  Home01Icon,
  Location01Icon,
  Motorbike01Icon,
  Package01Icon,
  Restaurant01Icon,
  ShoppingBag01Icon,
  UserIcon,
} from '@hugeicons/core-free-icons'
import type { IconSvgElement } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { LogoutButton } from '@/components/features/auth/logout-button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { RappiLogo, RappiWordmark } from '@/components/rappi-logo'

interface NavItem {
  href: string
  label: string
  icon?: IconSvgElement
}

interface RoleShellProps {
  title: string
  // eyebrow: string
  description: string
  navItems: NavItem[]
  userLabel: string
  children: ReactNode
}

const fallbackIcons: Record<string, IconSvgElement> = {
  Resumen: DashboardSquare01Icon,
  Establecimientos: Restaurant01Icon,
  'Mi establecimiento': Restaurant01Icon,
  Productos: Package01Icon,
  Pedidos: ShoppingBag01Icon,
  Analytics: Analytics01Icon,
  Perfil: UserIcon,
  Disponibilidad: Location01Icon,
  'Mis pedidos': ShoppingBag01Icon,
  Direcciones: Home01Icon,
}

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function RoleShell({
  title,
  // eyebrow,
  description,
  navItems,
  userLabel,
  children,
}: RoleShellProps) {
  const pathname = usePathname()

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-4 py-6">
          <Link
            href="/"
            aria-label="Rappi"
            className="flex shrink-0 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm group-data-[collapsible=icon]:justify-center"
          >
            <div className="flex items-center gap-2">
              <RappiLogo className="h-[18px] w-14 shrink-0 group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-10" />
              <RappiWordmark className="h-[18px] w-auto shrink-0 group-data-[collapsible=icon]:hidden" />
            </div>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            {/* <SidebarGroupLabel>{eyebrow}</SidebarGroupLabel> */}
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const icon = item.icon ?? fallbackIcons[item.label] ?? Motorbike01Icon

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        isActive={isActivePath(pathname, item.href)}
                      >
                        <Link href={item.href}>
                          <HugeiconsIcon icon={icon} strokeWidth={2} />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" tooltip={userLabel}>
                <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
                <span>{userLabel}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <LogoutButton />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <div className="flex min-h-svh flex-col bg-background text-foreground">
          <header className="flex min-h-16 items-center gap-3 border-b px-4 sm:px-6 lg:px-8">
            <SidebarTrigger />
            <div className="min-w-0">
              {/* <p className="text-xs font-semibold uppercase tracking-normal text-primary">
                {eyebrow}
              </p> */}
              <h1 className="truncate text-lg font-semibold tracking-normal sm:text-xl">
                {title}
              </h1>
            </div>
          </header>

          <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
            <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
              {description}
            </p>
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
