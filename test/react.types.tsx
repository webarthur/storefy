import * as ReactDOM from 'react-dom'
import * as React from 'react'

import { Storefy, StorefyStore, StorefyEvents } from '..'
import { StoreContext, useStorefy, connectStorefy } from '../react'

interface State {
  a: number
}

interface EventsDataTypesMap extends StorefyEvents<State> {
  'inc': undefined;
}

function init(store: StorefyStore<State>) {
  store.on('@init', () => ({ a: 0 }))
  store.on('inc', (state, data: number) => ({ a: state.a + data }))
}

const store = Storefy<State, EventsDataTypesMap>([init])

function Button() {
  const { dispatch, a } = useStorefy<State, EventsDataTypesMap>('a')

  const onClick = React.useCallback(() => dispatch('inc'), [])

  return <button onClick={onClick}>Count: {a}</button>
}

const App = connectStorefy<State>('a', ({ a }) => {
  return <>
    <div>Count: {a}</div>
    <Button/>
  </>
})

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App/>
  </StoreContext.Provider>,
  document.body
)
