'use client'

import { Logout01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'

import { logoutAction } from '@/lib/auth/actions'
import { SidebarMenuButton } from '@/components/ui/sidebar'

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SidebarMenuButton type="submit" className="w-full" tooltip="Cerrar sesión">
        <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
        <span>Cerrar sesión</span>
      </SidebarMenuButton>
    </form>
  )
}
