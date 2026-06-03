import { RappiLogo, RappiWordmark } from '@/components/rappi-logo'
import { Button } from './ui/button'
import { Input } from './ui/input'

export default function Navbar() {
  return (
    <header className="fixed top-0 z-50 flex w-full flex-row items-center justify-between gap-3 border-b bg-background p-4 sm:px-6 lg:px-8">
      <div className="flex shrink-0 flex-col gap-1">
        <div className="flex items-center gap-2">
          <RappiLogo className="h-[18px] w-14 shrink-0" />
          <RappiWordmark className="h-[18px] w-auto shrink-0" />
        </div>
        <p className="truncate text-sm text-muted-foreground">Buenos Aires, Argentina</p>
      </div>
      <div className="w-full max-w-3xl mx-autoflex items-center gap-2">
        <Input type="text" placeholder="Buscar"/>
      </div>
      <div className="">
        <Button variant="outline">
          Cerrar sesión
        </Button>
        <Button>
          Carrito
        </Button>
      </div>
    </header>
  )
}
