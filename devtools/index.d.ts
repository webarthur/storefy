import { StorefyStore, StorefyModule } from '..'

export const StorefyDevtools: {
  <State>(store: StorefyStore<State>): void
  (options?: object): <State>(store: StorefyStore<State>) => void
}

export const StorefyLogger: StorefyModule<unknown>
