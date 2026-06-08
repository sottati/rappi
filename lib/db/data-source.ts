export type DataSource = 'postgres' | 'mongodb' | 'redis' | 'cassandra'

export interface DataSourceMeta {
  label: string
  description: string
  color: string
}

export const DATA_SOURCE_META: Record<DataSource, DataSourceMeta> = {
  postgres: {
    label: 'PostgreSQL',
    description: 'Datos relacionales y transaccionales',
    color: '#336791',
  },
  mongodb: {
    label: 'MongoDB',
    description: 'Documentos flexibles y catálogos públicos',
    color: '#47A248',
  },
  redis: {
    label: 'Redis',
    description: 'Estado en vivo, cache y tracking',
    color: '#DC382D',
  },
  cassandra: {
    label: 'Cassandra',
    description: 'Históricos, métricas y lecturas por patrón',
    color: '#1287B1',
  },
}

/** Visible en cliente si `NEXT_PUBLIC_SHOW_DATA_SOURCES=true`. */
export function shouldShowDataSources(): boolean {
  return process.env.NEXT_PUBLIC_SHOW_DATA_SOURCES === 'true'
}
