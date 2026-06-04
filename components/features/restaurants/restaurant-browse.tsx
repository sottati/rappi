'use client'

import { FilterIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'

import type {
  RestaurantFilterId,
  RestaurantListing,
  RestaurantSortId,
} from '@/lib/rappi'
import {
  restaurantFilterOptions,
  restaurantSortOptions,
} from '@/lib/rappi'
import { cn } from '@/lib/utils'

import { RestaurantCard } from './restaurant-card'

interface RestaurantBrowseProps {
  restaurants: readonly RestaurantListing[]
  children?: ReactNode
}

function matchesFilter(restaurant: RestaurantListing, filter: RestaurantFilterId) {
  switch (filter) {
    case 'promos':
      return Boolean(restaurant.hasPromo)
    case 'rating':
      return restaurant.rating >= 4.5
    case 'fast':
      return restaurant.deliveryMinutes <= 35
    case 'new':
      return Boolean(restaurant.isNew)
    default:
      return true
  }
}

function sortRestaurants(
  items: RestaurantListing[],
  sort: RestaurantSortId
): RestaurantListing[] {
  const copy = [...items]
  switch (sort) {
    case 'rating':
      return copy.sort((a, b) => b.rating - a.rating)
    case 'deliveryTime':
      return copy.sort((a, b) => a.deliveryMinutes - b.deliveryMinutes)
    case 'deliveryFee':
      return copy.sort((a, b) => a.deliveryFee - b.deliveryFee)
    default:
      return copy
  }
}

export function RestaurantBrowse({ restaurants, children }: RestaurantBrowseProps) {
  const [activeFilters, setActiveFilters] = useState<RestaurantFilterId[]>([])
  const [sort, setSort] = useState<RestaurantSortId>('relevance')

  const toggleFilter = (id: RestaurantFilterId) => {
    setActiveFilters((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const filtered = useMemo(() => {
    let list = [...restaurants]
    if (activeFilters.length > 0) {
      list = list.filter((restaurant) =>
        activeFilters.every((filter) => matchesFilter(restaurant, filter))
      )
    }
    return sortRestaurants(list, sort)
  }, [activeFilters, restaurants, sort])

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Filtrar por:</span>
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            aria-label="Más filtros (próximamente)"
          >
            <HugeiconsIcon icon={FilterIcon} className="size-4" strokeWidth={2} />
          </button>
          {restaurantFilterOptions.map((option) => {
            const active = activeFilters.includes(option.id)
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => toggleFilter(option.id)}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground hover:border-primary/30'
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="restaurant-sort" className="shrink-0 text-sm text-muted-foreground">
            Ordenar por:
          </label>
          <select
            id="restaurant-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as RestaurantSortId)}
            className="h-9 min-w-[10rem] rounded-lg border border-border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {restaurantSortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {children}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-normal sm:text-xl">
          Restaurantes cerca de mi ubicación ({filtered.length})
        </h2>

        {filtered.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-10 text-center text-sm text-muted-foreground">
            No hay locales con esos filtros. Probá quitar alguno.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filtered.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
