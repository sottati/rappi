/** Ítem de categoría con imagen desde CDN de Rappi (home, tiendas o comidas). */
export type RappiCategoryIcon = {
  readonly label: string
  readonly src: string
  readonly href?: string
}

export const homeCategories = [
  {
    label: 'Restaurantes',
    src: 'https://images.rappi.com.ar/home-ab-objects/restaurants_r8.png?e=webp&d=150x150&q=50',
    href: '/restaurantes',
  },
  {
    label: 'Supermercados',
    src: 'https://images.rappi.com.ar/home-ab-objects/mercados_logo.png?e=webp&d=150x150&q=50',
  },
  {
    label: 'Farmacia',
    src: 'https://images.rappi.com.ar/home-ab-objects/iconfarma.png?e=webp&d=150x150&q=50',
  },
  {
    label: 'Kioscos',
    src: 'https://images.rappi.com.ar/home-ab-objects/express_r8.png?e=webp&d=150x150&q=50',
  },
  {
    label: 'Shopping',
    src: 'https://images.rappi.com.ar/home-ab-objects/iconecomm.png?e=webp&d=150x150&q=50',
  },
  {
    label: 'Turbo',
    src: 'https://images.rappi.com.ar/home-ab-objects/turbo_r8_offer.png?e=webp&d=150x150&q=50',
  },
  {
    label: 'Licores',
    src: 'https://images.rappi.com.ar/home-ab-objects/licor_new.png?e=webp&d=150x150&q=50',
  },
] as const satisfies readonly RappiCategoryIcon[]

export const storeCategories = [
  {
    label: 'Super',
    src: 'https://images.rappi.com.ar/store_categories/supermercados-1750870793998.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Express',
    src: 'https://images.rappi.com.ar/store_categories/express-1750871127945.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Carnes y Pescados',
    src: 'https://images.rappi.com.ar/store_categories/carnes-1750871181778.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Frutas y Verduras',
    src: 'https://images.rappi.com.ar/store_categories/frescos-1750871189130.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Salud y Belleza',
    src: 'https://images.rappi.com.ar/store_categories/farmacia-1750871197356.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Licores',
    src: 'https://images.rappi.com.ar/store_categories/licores-1750871205437.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Pastas y Panaderías',
    src: 'https://images.rappi.com.ar/store_categories/panaderia-1750871210451.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Saludables',
    src: 'https://images.rappi.com.ar/store_categories/tiendas-saludables-1750871216884.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Mascotas',
    src: 'https://images.rappi.com.ar/store_categories/mascotas-1750871233577.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Especializadas',
    src: 'https://images.rappi.com.ar/store_categories/especializadas-1750871312559.png?e=webp&q=20&d=72x72',
  },
  {
    label: 'Nuevas',
    src: 'https://images.rappi.com.ar/store_categories/teindas-nuevas-en-1750871324378.png?e=webp&q=20&d=72x72',
  },
] as const satisfies readonly RappiCategoryIcon[]

export const foodCategories = [
  {
    label: 'Pizza',
    src: 'https://images.rappi.com.ar/rests_taxonomy/62421396-09ee-4e2d-8c79-d1eaecdfcaac.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Hamburguesa',
    src: 'https://images.rappi.com.ar/rests_taxonomy/3b2189f4-54bc-47e5-8e69-ad8073de60a8.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Empanadas',
    src: 'https://images.rappi.com.ar/rests_taxonomy/dc9d03c6-05b7-49bf-a3d1-b82b7da29460.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Sushi',
    src: 'https://images.rappi.com.ar/rests_taxonomy/3fe1f131-18c4-4179-8df1-9dac5b1f3401.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Helados',
    src: 'https://images.rappi.com.ar/rests_taxonomy/5d68842e-24a2-445f-a3d1-0da8314f0745.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Milanesas',
    src: 'https://images.rappi.com.ar/rests_taxonomy/627c58d1-1754-40a3-a4b7-95abd2bd7503.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Panadería',
    src: 'https://images.rappi.com.ar/rests_taxonomy/e8da3305-4940-49ea-a5ab-e69afe46c279.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Café',
    src: 'https://images.rappi.com.ar/rests_taxonomy/bea5f35a-53d8-4c5c-b395-403ef72103f4.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Árabe',
    src: 'https://images.rappi.com.ar/rests_taxonomy/666a9864-ab47-4568-9b18-9d2b5dee63bc.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Mexicana',
    src: 'https://images.rappi.com.ar/rests_taxonomy/a22e95d1-6736-47cc-a5ec-a5d5884a30e4.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Asiática',
    src: 'https://images.rappi.com.ar/rests_taxonomy/9acaba2a-ab5c-4e2f-a694-41f41cc82196.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Italiana',
    src: 'https://images.rappi.com.ar/rests_taxonomy/9d09fc9f-16c2-497f-9137-e3fd3c4ca187.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Peruana',
    src: 'https://images.rappi.com.ar/rests_taxonomy/c171d7e4-dccc-4103-b409-17cd8bd1ff47.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Americana',
    src: 'https://images.rappi.com.ar/rests_taxonomy/8756fb49-2a56-477d-b7d8-3e533c4b3641.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Argentina',
    src: 'https://images.rappi.com.ar/rests_taxonomy/4b8c6bf1-d2e6-4aca-879c-ee6252010e90.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Saludable',
    src: 'https://images.rappi.com.ar/rests_taxonomy/5c8dab0d-8495-4822-9934-0d3d4547f4bf.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Postres',
    src: 'https://images.rappi.com.ar/rests_taxonomy/7dae254e-a3c6-49e4-88a9-6714b38d590e.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Pokes',
    src: 'https://images.rappi.com.ar/rests_taxonomy/b5791fc7-1da1-4629-b156-51ee93b117c3.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Jugos',
    src: 'https://images.rappi.com.ar/rests_taxonomy/86b14807-e9f4-4e58-bc94-9d512839e646.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Hot Dogs',
    src: 'https://images.rappi.com.ar/rests_taxonomy/5cb12bea-40ae-4af3-a3ff-690d2b0ba14d.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Pescados',
    src: 'https://images.rappi.com.ar/rests_taxonomy/e744d6f7-7c02-47f1-b11e-d1ce3924707d.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Pollo',
    src: 'https://images.rappi.com.ar/rests_taxonomy/ef509d8b-b3b0-4c9b-9183-5e80768d460d.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Vegetariana',
    src: 'https://images.rappi.com.ar/rests_taxonomy/e13de792-fd18-4a48-9ea0-de6a618e8fbd.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Sándwiches',
    src: 'https://images.rappi.com.ar/rests_taxonomy/0fea8646-ef43-4112-8b39-7cc6b3a8afed.png?e=webp&q=10&d=10x10',
  },
  {
    label: 'Desayunos y Meriendas',
    src: 'https://images.rappi.com.ar/rests_taxonomy/fba92cdb-d580-4ff1-a4cb-ba0a4ae4d326.png?e=webp&q=10&d=10x10',
  },
] as const satisfies readonly RappiCategoryIcon[]
