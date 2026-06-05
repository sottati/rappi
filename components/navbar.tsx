import { RappiLogo, RappiWordmark } from '@/components/rappi-logo'
import Link from 'next/link'

import { NavbarActions } from '@/components/navbar-actions'
import { getSession } from '@/lib/auth/session'
import { Input } from './ui/input'

export default async function Navbar() {
  const session = await getSession()
  return (
    <header className="fixed top-0 z-50 flex w-full flex-row items-center justify-between gap-3 border-b bg-background p-4 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="flex shrink-0 flex-col gap-1 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
      >
        <div className="flex items-center gap-2">
          <RappiLogo className="h-[18px] w-14 shrink-0" />
          <RappiWordmark className="h-[18px] w-auto shrink-0" />
        </div>
        <p className="truncate text-sm text-muted-foreground">Buenos Aires, Argentina</p>
      </Link>
      <div className="mx-auto flex w-full max-w-3xl items-center gap-2 px-2">
        <Input type="search" placeholder="Buscar en Rappi..." className="w-full" />
      </div>
      <NavbarActions session={session} />
    </header>
  )
}
