import { Skeleton } from '@/components/ui/skeleton'

function ProductCardSkeleton() {
  return (
    <article className="flex gap-3 rounded-2xl border border-border/80 bg-card p-3">
      <Skeleton className="size-20 shrink-0 rounded-xl sm:size-24" />
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex shrink-0 items-end">
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>
    </article>
  )
}

function CategorySkeleton({ productCount }: { productCount: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-32" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: productCount }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  )
}

export function EstablishmentCatalogSkeleton() {
  return (
    <section
      className="mx-auto w-full max-w-6xl space-y-4 px-4 py-8 sm:px-6 lg:px-8"
      aria-busy="true"
      aria-label="Cargando menú"
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-4 w-48" />
      </div>

      <CategorySkeleton productCount={4} />
      <CategorySkeleton productCount={2} />
    </section>
  )
}
