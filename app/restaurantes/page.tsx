import { CategoryRail } from '@/components/features/landing/category-rail'
import { LandingSection } from '@/components/features/landing/landing-section'
import { RestaurantBrowse } from '@/components/features/restaurants/restaurant-browse'
import { RestaurantCard } from '@/components/features/restaurants/restaurant-card'
import { RestaurantsHero } from '@/components/features/restaurants/restaurants-hero'
import Navbar from '@/components/navbar'
import {
  catalogRestaurants,
  foodCategories,
  nearbyRestaurants,
  topChosenRestaurants,
} from '@/lib/rappi'

export default function RestaurantesPage() {
  return (
    <main className="min-h-svh bg-background text-foreground">
      <Navbar />
      <RestaurantsHero />
      <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <LandingSection title="Locales con menú">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {catalogRestaurants.map((restaurant) => (
              <RestaurantCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        </LandingSection>

        <RestaurantBrowse restaurants={nearbyRestaurants}>
          <LandingSection title="¿Qué se te antoja?">
            <CategoryRail items={foodCategories} />
          </LandingSection>

          <LandingSection title="¡Los 10 más elegidos!">
            <CategoryRail items={topChosenRestaurants} variant="restaurant" />
          </LandingSection>
        </RestaurantBrowse>
      </div>
    </main>
  )
}
