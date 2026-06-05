import { mockTestPassword } from '@/lib/db/postgres/mock'

const testUsers = [
  { email: 'admin@burger.example', role: 'Admin', path: '/admin' },
  { email: 'lucia.gomez@example.com', role: 'Repartidor', path: '/repartidor' },
  { email: 'ana.perez@example.com', role: 'Usuario', path: '/usuario' },
] as const

export function TestUsersHint() {
  return (
    <div className="rounded-lg border border-dashed bg-muted/40 p-4 text-sm">
      <p className="font-medium">Usuarios de prueba</p>
      <p className="mt-1 text-muted-foreground">
        Contraseña para todos: <code className="text-foreground">{mockTestPassword}</code>
      </p>
      <ul className="mt-3 space-y-2">
        {testUsers.map((user) => (
          <li key={user.email} className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <span className="font-medium">{user.role}</span>
              <span className="text-muted-foreground"> · {user.email}</span>
            </span>
            <span className="text-xs text-muted-foreground">{user.path}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
