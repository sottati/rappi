import type { RappiCategoryIcon } from './category-icons'

const logo = (path: string) =>
  `https://images.rappi.com.ar/restaurants_logo/${path}?e=webp&d=150x150&q=50`

const taxonomy = (id: string) =>
  `https://images.rappi.com.ar/rests_taxonomy/${id}.png?e=webp&d=150x150&q=50`

const homeObject = (path: string) =>
  `https://images.rappi.com.ar/home-ab-objects/${path}?e=webp&d=150x150&q=50`

/** Términos destacados en home (Lo más buscado). */
export const mostSearched = [
  { label: 'Figurita', src: homeObject('iconecomm.png') },
  { label: 'Helado', src: taxonomy('5d68842e-24a2-445f-a3d1-0da8314f0745') },
  { label: 'Figurita panini', src: homeObject('iconecomm.png') },
  { label: 'Panini', src: taxonomy('dc9d03c6-05b7-49bf-a3d1-b82b7da29460') },
  { label: 'Queso', src: homeObject('mercados_logo.png') },
  { label: 'Chocolate', src: taxonomy('7dae254e-a3c6-49e4-88a9-6714b38d590e') },
  { label: 'Leche', src: homeObject('mercados_logo.png') },
  { label: 'Sushi', src: taxonomy('3fe1f131-18c4-4179-8df1-9dac5b1f3401') },
  { label: 'Pan', src: taxonomy('e8da3305-4940-49ea-a5ab-e69afe46c279') },
  { label: 'Figuritas', src: homeObject('iconecomm.png') },
] as const satisfies readonly RappiCategoryIcon[]

/** Marcas del carrusel "Los 10 más elegidos" (logos desde CDN Rappi). */
export const topChosenRestaurants = [
  { label: "McDonald's", src: logo('mcdonalds-1600092917510-1617128080018.png') },
  { label: 'Mostaza', src: logo('logo-1663343387541.png') },
  { label: 'Burger King', src: logo('burger-1610076086158.png') },
  { label: 'Grido', src: logo('gridito-1615398972244.png') },
  { label: 'El Club de la Milanesa', src: logo('logooo-1673035573537.png') },
  { label: 'Nicolo Helados', src: logo('lo-1643662505967.png') },
  { label: 'Rapanui', src: logo('rapa-1625747937080.png') },
  { label: 'KFC', src: logo('114941-1557841048.png') },
  { label: 'Subway', src: logo('113797-1545308320.png') },
  { label: 'Cremolatti', src: logo('cremolatti-1581946239598.png') },
] as const satisfies readonly RappiCategoryIcon[]
