'use client'

import { UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

import { CartPopover } from '@/components/features/cart/cart-popover'
import { Button } from '@/components/ui/button'

export function NavbarActions() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button variant="outline" asChild>
        <Link href="/login">
          <HugeiconsIcon icon={UserIcon} data-icon="inline-start" strokeWidth={2} />
          Iniciar sesión
        </Link>
      </Button>
      <CartPopover />
    </div>
  )
}
