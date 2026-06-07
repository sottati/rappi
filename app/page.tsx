import { CategoryRail } from '@/components/features/landing/category-rail'
import { LandingHero } from '@/components/features/landing/landing-hero'
import Navbar from '@/components/navbar'
import { homeCategories } from '@/lib/rappi'

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <LandingHero />
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 pb-12 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-normal sm:text-xl">
            ¿Necesitas algo más?
          </h2>
          <CategoryRail items={homeCategories} />
        </div>
      </div>
    </main>
  )
}
