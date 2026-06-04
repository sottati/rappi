import { AuthShell } from '@/components/features/auth/auth-shell'
import { SigninForm } from '@/components/features/auth/signin-form'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Crear cuenta',
  description: 'Registrate en Rappi data console.',
}

export default function SigninPage() {
  return (
    <AuthShell
      title="Crear cuenta"
      description="Completá el formulario para registrarte. El alta real se conectará con Supabase Auth."
      footer={
        <>
          <Link href="/" className="font-medium text-primary hover:underline">
            Volver al inicio
          </Link>
        </>
      }
    >
      <SigninForm />
    </AuthShell>
  )
}
