import { AuthShell } from '@/components/features/auth/auth-shell'
import { LoginForm } from '@/components/features/auth/login-form'
import { TestUsersHint } from '@/components/features/auth/test-users-hint'
import { sanitizeNextPath } from '@/lib/auth/next-path'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accedé a tu cuenta de Rappi data console.',
}

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams
  const nextPath = sanitizeNextPath(next)

  return (
    <AuthShell
      title="Iniciar sesión"
      description="Accedé con email y contraseña. Con MOCK_DB=true las cuentas viven en memoria; con Postgres real, corré pnpm db:seed."
      footer={
        <>
          <Link href="/" className="font-medium text-primary hover:underline">
            Volver al inicio
          </Link>
        </>
      }
    >
      <div className="space-y-6">
        <LoginForm nextPath={nextPath} />
        <TestUsersHint />
      </div>
    </AuthShell>
  )
}
