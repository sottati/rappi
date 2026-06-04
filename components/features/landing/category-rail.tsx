import type { RappiCategoryIcon } from '@/lib/rappi'

import { LandingTile } from './landing-tile'

interface CategoryRailProps {
  items: readonly RappiCategoryIcon[]
  variant?: 'category' | 'restaurant'
}

export function CategoryRail({ items, variant = 'category' }: CategoryRailProps) {
  return (
    <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-2">
      {items.map((item) => (
        <LandingTile
          key={item.label}
          label={item.label}
          src={item.src}
          href={item.href}
          variant={variant}
        />
      ))}
    </div>
  )
}
