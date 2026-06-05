'use client'

import { UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

import { CartPopover } from '@/components/features/cart/cart-popover'
import { Button } from '@/components/ui/button'
import { getRoleHomePath, type AppSession } from '@/lib/auth/session-types'

interface NavbarActionsProps {
  session: AppSession | null
}

export function NavbarActions({ session }: NavbarActionsProps) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      {session ? (
        <Button variant="outline" asChild>
          <Link href={getRoleHomePath(session.role)} title={session.email}>
            <HugeiconsIcon icon={UserIcon} data-icon="inline-start" strokeWidth={2} />
            <span className="max-w-28 truncate sm:max-w-40">{session.displayName}</span>
          </Link>
        </Button>
      ) : (
        <Button variant="outline" asChild>
          <Link href="/login">
            <HugeiconsIcon icon={UserIcon} data-icon="inline-start" strokeWidth={2} />
            Iniciar sesión
          </Link>
        </Button>
      )}
      <CartPopover />
    </div>
  )
}
