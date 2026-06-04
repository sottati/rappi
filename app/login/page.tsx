import { AuthShell } from '@/components/features/auth/auth-shell'
import { LoginForm } from '@/components/features/auth/login-form'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description: 'Accedé a tu cuenta de Rappi data console.',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesión"
      description="Accedé con tu email y contraseña. La autenticación real se integrará con Supabase Auth."
      footer={
        <>
          <Link href="/" className="font-medium text-primary hover:underline">
            Volver al inicio
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}
