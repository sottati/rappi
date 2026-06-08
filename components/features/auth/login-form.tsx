'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginAction, type LoginFormState } from '@/lib/auth/actions'
import Link from 'next/link'

const initialState: LoginFormState = {}

interface LoginFormProps {
  nextPath?: string | null
}

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState)

  return (
    <form className="space-y-4" action={formAction} noValidate>
      {nextPath ? (
        <input type="hidden" name="next" value={nextPath} readOnly />
      ) : null}
      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@burger.example"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-medium">
          Contraseña
        </label>
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="test123"
          required
        />
      </div>

      {state.error ? (
        <p className="text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? 'Ingresando…' : 'Iniciar sesión'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿No tenés cuenta?{' '}
        <Link href="/signin" className="font-medium text-primary hover:underline">
          Crear cuenta
        </Link>
      </p>
    </form>
  )
}
