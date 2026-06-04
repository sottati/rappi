import { CategoryRail } from '@/components/features/landing/category-rail'
import { LandingHero } from '@/components/features/landing/landing-hero'
import { LandingSection } from '@/components/features/landing/landing-section'
import Navbar from '@/components/navbar'
import { homeCategories, mostSearched, topChosenRestaurants } from '@/lib/rappi'

export default function Page() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <LandingHero />
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-8 pb-12 sm:px-6 lg:px-8">
        <LandingSection title="¿Necesitas algo más?">
          <CategoryRail items={homeCategories} />
        </LandingSection>

        <LandingSection title="Lo más buscado">
          <CategoryRail items={mostSearched} />
        </LandingSection>

        <LandingSection title="¡Los 10 más elegidos!">
          <CategoryRail items={topChosenRestaurants} variant="restaurant" />
        </LandingSection>
      </div>
    </main>
  )
}
