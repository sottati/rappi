'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_DELIVERY_FEE = 990
const DEFAULT_SERVICE_FEE = 490
const DEFAULT_DELIVERY_MINUTES = 35
const DEFAULT_ADDRESS_LABEL = 'Casa'
const DEFAULT_ADDRESS_DETAIL = 'Av. Corrientes 1234, CABA'

export interface CartItem {
  id: string
  idProducto: number
  idEstablecimiento: number
  name: string
  description?: string
  unitPrice: number
  quantity: number
  imageSrc?: string
}

export interface AddCartItemInput {
  idProducto: number
  idEstablecimiento: number
  restaurantName: string
  restaurantLogoSrc?: string
  deliveryMinutes?: number
  deliveryFee?: number
  serviceFee?: number
  name: string
  description?: string
  unitPrice: number
  imageSrc?: string
}

interface CartState {
  restaurantId: number | null
  restaurantName: string
  restaurantLogoSrc: string
  deliveryMinutes: number
  deliveryFee: number
  serviceFee: number
  addressLabel: string
  addressDetail: string
  items: CartItem[]
  addItem: (item: AddCartItemInput, quantity?: number) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
}

const emptyCartState = {
  restaurantId: null,
  restaurantName: '',
  restaurantLogoSrc: '',
  deliveryMinutes: DEFAULT_DELIVERY_MINUTES,
  deliveryFee: DEFAULT_DELIVERY_FEE,
  serviceFee: DEFAULT_SERVICE_FEE,
  addressLabel: DEFAULT_ADDRESS_LABEL,
  addressDetail: DEFAULT_ADDRESS_DETAIL,
  items: [],
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      ...emptyCartState,
      addItem: (item, quantity = 1) =>
        set((state) => {
          const incomingRestaurantId = item.idEstablecimiento
          const shouldReplaceCart =
            state.restaurantId !== null &&
            state.restaurantId !== incomingRestaurantId

          const baseState = shouldReplaceCart ? emptyCartState : state
          const id = String(item.idProducto)
          const existing = baseState.items.find(
            (cartItem) => cartItem.id === id
          )
          const items = existing
            ? baseState.items.map((cartItem) =>
                cartItem.id === id
                  ? { ...cartItem, quantity: cartItem.quantity + quantity }
                  : cartItem
              )
            : [
                ...baseState.items,
                {
                  id,
                  idProducto: item.idProducto,
                  idEstablecimiento: item.idEstablecimiento,
                  name: item.name,
                  description: item.description,
                  unitPrice: item.unitPrice,
                  quantity,
                  imageSrc: item.imageSrc,
                },
              ]

          return {
            ...baseState,
            restaurantId: incomingRestaurantId,
            restaurantName: item.restaurantName,
            restaurantLogoSrc: item.restaurantLogoSrc ?? '',
            deliveryMinutes: item.deliveryMinutes ?? DEFAULT_DELIVERY_MINUTES,
            deliveryFee: item.deliveryFee ?? DEFAULT_DELIVERY_FEE,
            serviceFee: item.serviceFee ?? DEFAULT_SERVICE_FEE,
            items,
          }
        }),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) => (item.id === id ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),
      clearCart: () => set(emptyCartState),
    }),
    {
      name: 'rappi-cart',
      partialize: (state) => ({
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        restaurantLogoSrc: state.restaurantLogoSrc,
        deliveryMinutes: state.deliveryMinutes,
        deliveryFee: state.deliveryFee,
        serviceFee: state.serviceFee,
        addressLabel: state.addressLabel,
        addressDetail: state.addressDetail,
        items: state.items,
      }),
    }
  )
)

export function getCartItemCount(items: Pick<CartItem, 'quantity'>[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function getCartSubtotal(
  items: Pick<CartItem, 'unitPrice' | 'quantity'>[]
) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
}

export function getCartTotal({
  items,
  deliveryFee,
  serviceFee,
}: {
  items: Pick<CartItem, 'unitPrice' | 'quantity'>[]
  deliveryFee: number
  serviceFee: number
}) {
  return getCartSubtotal(items) + deliveryFee + serviceFee
}
