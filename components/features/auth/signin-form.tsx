'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import type { FormEvent } from 'react'

function handleSubmit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault()
}

export function SigninForm() {
  return (
    <form className="space-y-4" onSubmit={handleSubmit} noValidate>
      <div className="space-y-2">
        <label htmlFor="signin-name" className="text-sm font-medium">
          Nombre
        </label>
        <Input
          id="signin-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Tu nombre"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="signin-email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="signin-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="signin-password" className="text-sm font-medium">
          Contraseña
        </label>
        <Input
          id="signin-password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="signin-password-confirm" className="text-sm font-medium">
          Confirmar contraseña
        </label>
        <Input
          id="signin-password-confirm"
          name="passwordConfirm"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Iniciar sesión
        </Link>
      </p>
    </form>
  )
}
