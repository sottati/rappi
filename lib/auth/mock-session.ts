export type AppRole = 'admin' | 'repartidor' | 'usuario'

export interface MockSession {
  role: AppRole
  userId: number
  displayName: string
  email: string
}

const sessions: Record<AppRole, MockSession> = {
  admin: {
    role: 'admin',
    userId: 1,
    displayName: 'Duenio Burger Palermo',
    email: 'admin@burger.example',
  },
  repartidor: {
    role: 'repartidor',
    userId: 1,
    displayName: 'Lucia Gomez',
    email: 'lucia.gomez@example.com',
  },
  usuario: {
    role: 'usuario',
    userId: 1,
    displayName: 'Ana Perez',
    email: 'ana.perez@example.com',
  },
}

export async function getMockSession(role: AppRole): Promise<MockSession> {
  return sessions[role]
}
