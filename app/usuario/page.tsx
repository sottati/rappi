import { Suspense } from 'react'

import {
  UsuarioDirecciones,
  UsuarioDireccionesSkeleton,
} from '@/components/features/usuario/usuario-direcciones'
import { requireSession } from '@/lib/auth/require-session'

export default async function UsuarioPage() {
  const session = await requireSession('usuario')

  return (
    <section className="grid gap-6">
      <div>
        <h2 className="text-xl font-semibold">Perfil de usuario</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Consumidor final autenticado con la identidad interna de la app.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Nombre</p>
            <p className="font-medium">{session.displayName}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{session.email}</p>
          </div>
        </div>
      </div>

      <Suspense fallback={<UsuarioDireccionesSkeleton />}>
        <UsuarioDirecciones idCliente={session.userId} />
      </Suspense>
    </section>
  )
}
