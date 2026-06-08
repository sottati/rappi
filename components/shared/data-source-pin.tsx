'use client'

import type { ComponentProps, ReactElement } from 'react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  DATA_SOURCE_META,
  shouldShowDataSources,
  type DataSource,
} from '@/lib/db/data-source'
import { cn } from '@/lib/utils'

function PostgresIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
    >
      <ellipse cx="8" cy="4" rx="5" ry="2" fill="currentColor" opacity="0.9" />
      <path
        d="M3 4v8c0 1.1 2.24 2 5 2s5-.9 5-2V4"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M3 8c0 1.1 2.24 2 5 2s5-.9 5-2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function MongoIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8.2 1.5c-.1 2.1-.9 3.8-2 5.3-.8 1-1.7 1.8-2.4 3.1-.5.9-.8 1.9-1 3-.2 1.4-.1 2.7.2 3.6.1-.8.3-1.6.6-2.3.5-1.2 1.2-2.2 1.9-3.2.9-1.3 1.8-2.6 2.2-4.5.4 1.9 1.3 3.2 2.2 4.5.7 1 1.4 2 1.9 3.2.3.7.5 1.5.6 2.3.3-.9.4-2.2.2-3.6-.2-1.1-.5-2.1-1-3-.7-1.3-1.6-2.1-2.4-3.1-1.1-1.5-1.9-3.2-2-5.3z" />
    </svg>
  )
}

function RedisIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path
        d="M2 5.5 8 2.5l6 3v2L8 8.5 2 7.5v-2Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M2 8.5 8 5.5l6 3v2L8 11.5 2 10.5v-2Z"
        fill="currentColor"
        opacity="0.65"
      />
      <path
        d="M2 11.5 8 8.5l6 3v2L8 14.5 2 13.5v-2Z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  )
}

function CassandraIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="2.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="0.9" fill="currentColor" />
    </svg>
  )
}

const DATA_SOURCE_ICONS: Record<
  DataSource,
  (props: { className?: string }) => ReactElement
> = {
  postgres: PostgresIcon,
  mongodb: MongoIcon,
  redis: RedisIcon,
  cassandra: CassandraIcon,
}

export interface DataSourcePinProps extends Omit<ComponentProps<'span'>, 'children'> {
  source: DataSource
  /** Borde superior, hacia adentro desde la esquina. */
  side?: 'left' | 'right'
  /** Texto extra en el tooltip, ej. "restaurant_catalogs". */
  detail?: string
  /** Ignora `NEXT_PUBLIC_SHOW_DATA_SOURCES` y fuerza visibilidad. */
  forceShow?: boolean
}

const PIN_SIDE_CLASSES = {
  left: 'left-5',
  right: 'right-5',
} as const

export function DataSourcePin({
  source,
  side = 'right',
  detail,
  forceShow = false,
  className,
  ...props
}: DataSourcePinProps) {
  if (!forceShow && !shouldShowDataSources()) {
    return null
  }

  const meta = DATA_SOURCE_META[source]
  const Icon = DATA_SOURCE_ICONS[source]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          role="img"
          aria-label={`Fuente: ${meta.label}`}
          className={cn(
            'pointer-events-auto absolute top-0 z-10 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border-2 border-background text-white shadow-sm',
            PIN_SIDE_CLASSES[side],
            className,
          )}
          style={{ backgroundColor: meta.color }}
          {...props}
        >
          <Icon className="size-3.5" />
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}>
        <span className="font-medium">{meta.label}</span>
        <span className="text-background/80"> · {meta.description}</span>
        {detail ? (
          <span className="mt-0.5 block text-background/70">{detail}</span>
        ) : null}
      </TooltipContent>
    </Tooltip>
  )
}
