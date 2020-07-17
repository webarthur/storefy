import { Storefy, StorefyModule, StorefyStore } from '..'
import { StorefyDevtools, StorefyLogger } from '../devtools'

interface State {
  a: number
  b: string
}

// Reducer typed as a Module
const init: StorefyModule<State> = store => {
  store.on('@init', () => ({ a: 0, b: '' }))
}

// Duck-typed reducer
function setUp(store: StorefyStore<State>): void {
  store.on('inc', state => ({ a: state.a + 1 }))
}

// Store
const store = Storefy<State>([
  init,
  setUp,
  StorefyLogger,
  StorefyDevtools,
  StorefyDevtools(),
])

// String event dispatch
store.dispatch('inc')

// Symbolic event
const sym = Symbol('sym')
store.on(sym, (state, data: number) => ({ a: state.a + data }))
store.dispatch(sym, 2)

// Async reducer
store.on('comment:post', async (_, data: string) => {
  store.dispatch('comment:posting')
  try {
    const response = await fetch('https://github.com', { body: data })
    const result = await response.json()
    store.dispatch('comment:posted', result)
  } catch (e) {
    store.dispatch('comment:error', e)
  }
})

const state = store.get()
state.a
