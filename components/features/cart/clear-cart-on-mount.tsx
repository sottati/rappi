'use client'

import { useEffect, useRef } from 'react'

import { useCartStore } from '@/lib/cart/store'

export function ClearCartOnMount() {
  const clearCart = useCartStore((state) => state.clearCart)
  const clearedRef = useRef(false)

  useEffect(() => {
    if (!clearedRef.current) {
      clearCart()
      clearedRef.current = true
    }
  }, [clearCart])

  return null
}
