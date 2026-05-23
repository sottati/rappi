export type QueryResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export function ok<T>(data: T): QueryResult<T> {
  return { data, error: null }
}

export function fail<T>(error: string): QueryResult<T> {
  return { data: null, error }
}

export function shouldUseMockData(): boolean {
  return process.env.MOCK_DB !== 'false'
}
