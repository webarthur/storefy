# Storefy

A tiny event-based Redux-like state manager for **web**.

* **Small.** 167 bytes (minified and gzipped). No dependencies.
  It uses [Size Limit] to control size.
* **Fast.** It tracks what parts of state were changed and re-renders
  only components based on the changes.
* **Hooks.** The same Redux reducers.
* **Modular.** API created to move business logic away from React components.
* **Immutable.**

## Browser Support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png) | ![Edge](https://raw.github.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) |
--- | --- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | Latest ✔ | None &times; |

## Install

```sh
npm install storefy
```

Using unpkg CDN:

```html
<script src="https://unpkg.com/storefy/dist/storefy.min.js"></script>
```

## Examples

NodeJs:

```js
const Storefy = Storefy

const store = Storefy(function (store) {
  store.on('@init', { count: 0 }) // Initial state
  store.on('increment', ({ count }) => ({ count: count + 1 }))
})

store.dispath('increment') // count = 1
store.dispath('increment') // count = 2
```

In a browser you can use the global Storefy function:

```js
var store = Storefy(function (store) {
  store.on('@init', { count: 0 }) // Initial state
  store.on('increment', ({ count }) => ({ count: count + 1 }))
})

store.dispath('increment') // count = 1
store.dispath('increment') // count = 2
```

```js
var store = Storefy({ count: 10 }) // Initial state
store.on('increment', ({ count }) => ({ count: count + 1 }))

store.dispath('increment') // count = 11
store.dispath('increment') // count = 12
```

Multiple modules: Initial state, reducers and business logic are packed in independent modules

```js
// Users module
var users = function (store) {
  store.on('@init', { users: [] })
  store.on('users:add', function (state, data) {
    state.users.push(data)
  })
}
// Cart module
var cart = function (store) {
  store.on('@init', {
    cart: {
      products: [],
      budget: 0
    }
  })
  store.on('cart:add', function (state, data) {
    state.cart.products.push(data)
    state.cart.budget += data.cost
  })
}

var store = Storefy(users, cart, /* etc... */)
```

Vue:

```js
Vue.prototype.$store = Storefy(function (store) {
  store.on('vue:init', function () { console.log('Vue has started!') })
})

var app = new Vue({
  mounted () {
    this.$store.dispath('vue:init')
  }
})
```

Typescript:

```js
import { Storefy } from 'storefy'

// Initial state, reducers and business logic are packed in independent modules
let increment = (store) => {
  // Initial state
  store.on('@init', () => ({ count: 0 }))
  // Reducers returns only changed part of the state
  store.on('inc', ({ count }) => ({ count: count + 1 }))
}

export const store = Storefy(increment)
```

React:

```js
import { useStorefy } from 'storefy/react' // or storefy/preact

export const Counter = () => {
  // Counter will be re-render only on `state.count` changes
  const { dispatch, count } = useStorefy('count')
  return <button onClick={() => dispatch('inc')}>{count}</button>
}
```

```js
import { StoreContext } from 'storefy/react'

render(
  <StoreContext.Provider value={store}>
    <Counter />
  </StoreContext.Provider>,
  document.body
)
```

## The Store

The store should be created with `Storefy()` function. It accepts mutiple arguments as modules.

Each module is just a function, which will accept a `store`
and bind their event listeners.

```js
// store/index.js
import { Storefy } from 'storefy'

import { projects } from './projects'
import { users } from './users'

export const store = Storefy(projects, users)
```

```js
// store/projects.js

export function projects (store) {
  store.on('@init', { projects: [] })

  store.on('projects/add', ({ projects }, project) => {
    return { projects: projects.concat([project]) }
  })
}
```

The store has 3 methods:

* `store.get()` will return current state. The state is always an object.
* `store.on(event, callback)` will add an event listener.
* `store.dispatch(event, data)` will emit an event with optional data.


## Events

There are three built-in events:

* `@init` will be fired in `Storefy`. The best moment to set
  an initial state.
* `@dispatch` will be fired on every new action (on `store.dispatch()` calls
  and `@changed` event). It receives an array with the event name
  and the event’s data. Can be useful for debugging.
* `@changed` will be fired when any event changes the state.
  It receives object with state changes.

To add an event listener, call `store.on()` with event name and callback.

```js
store.on('@dispatch', (state, [event, data]) => {
  console.log(`Storefy: ${ event } with `, data)
})
```

`store.on()` will return cleanup function. This function will remove
the event listener.

```js
const unbind = store.on('@changed', …)
unbind()
```

You can dispatch any other events. Just do not start event names with `@`.

If the event listener returns an object, this object will update the state.
You do not need to return the whole state, return an object
with changed keys.

```js
// users: [] will be added to state on initialization
store.on('@init', { users: [] })
```

It could be a function too:

```js
// users: [] will be added to state on initialization
store.on('@init', () => {
  { users: [] }
})
```

Event listener accepts the current state as a first argument
and optional event object as a second.

So event listeners can be a reducer as well. As in Redux’s reducers,
you should change immutable.

```js
store.on('users/save', ({ users }, user) => {
  return {
    users: { ...users, [user.id]: user }
  }
})

store.dispatch('users/save', { id: 1, name: 'Ivan' })
```

You can dispatch other events in event listeners. It can be useful for async
operations.

```js
store.on('users/add', async (state, user) => {
  try {
    await api.addUser(user)
    store.dispatch('users/save', user)
  } catch (e) {
    store.dispatch('errors/server-error')
  }
})
```


## Components

For functional components, `useStorefy` hook will be the best option:

```js
import { useStorefy } from 'storefy/react' // Use 'storefy/preact' for Preact

const Users = () => {
  const { dispatch, users, projects } = useStorefy('users', 'projects')
  const onAdd = useCallback(user => {
    dispatch('users/add', user)
  })
  return <div>
    {users.map(user => <User key={user.id} user={user} projects={projects} />)}
    <NewUser onAdd={onAdd} />
  </div>
}
```

For class components, you can use `connectStorefy()` decorator.

```js
import { connectStorefy } from 'storefy/react' // Use 'storefy/preact' for Preact

class Users extends React.Component {
  onAdd = () => {
    this.props.dispatch('users/add', user)
  }
  render () {
    return <div>
      {this.props.users.map(user => <User key={user.id} user={user} />)}
      <NewUser onAdd={this.onAdd} />
    </div>
  }
}

export default connectStorefy('users', 'anotherStateKey', Users)
```

`useStorefy` hook and `connectStorefy()` accept the list of state keys to pass
into `props`. It will re-render only if this keys will be changed.


## DevTools

Storefy supports debugging with [Redux DevTools Extension].

```js
import { storefyDevtools } from 'storefy/devtools';

const store = Storefy([
  …
  process.env.NODE_ENV !== 'production' && storefyDevtools
])
```

DevTools will also warn you about **typo in event name**. It will throw an error
if you are dispatching event, but nobody subscribed to it.

Or if you want to print events to `console` you can use built-in logger.
It could be useful for simple cases or to investigate issue in error trackers.

```js
import { storefyLogger } from 'storefy/devtools';

const store = Storefy([
  …
  process.env.NODE_ENV !== 'production' && storefyLogger
])
```

[Redux DevTools Extension]: https://github.com/zalmoxisus/redux-devtools-extension


## TypeScript

Storefy delivers TypeScript declaration which allows to declare type
of state and optionally declare types of events and parameter.

If Storefy store has to be full type safe the event types declaration
interface has to be delivered as second type to `createStore` function.

```typescript
import { Storefy, StoreonModufy } from 'storefy'
import { useStorefy } from 'storefy/react' // or storefy/preact

// State structure
interface State {
  counter: number
}

// Events declaration: map of event names to type of event data
interface Events {
  // `inc` event which do not goes with any data
  'inc': undefined
  // `set` event which goes with number as data
  'set': number
}

const counterModule: StoreonModufy<State, Events> = store => {
  store.on('@init', () => ({ counter: 0}))
  store.on('inc', state => ({ counter: state.counter + 1}))
  store.on('set', (state, event) => ({ counter: event}))
}

const store = Storefy<State, Events>([counterModule])

const Counter = () => {
  const { dispatch, count } = useStorefy<State, Events>('count')
  // Correct call
  dispatch('set', 100)
  // Compilation error: `set` event do not expect string data
  dispatch('set', "100")
  …
}

// Correct calls:
store.dispatch('set', 100)
store.dispatch('inc')

// Compilation errors:
store.dispatch('inc', 100)   // `inc` doesn’t have data
store.dispatch('set', "100") // `set` event do not expect string data
store.dispatch('dec')        // Unknown event
```

In order to work properly for imports, it is considering adding
`allowSyntheticDefaultImports: true` to `tsconfig.json`.

## Server-Side Rendering

In order to preload data for server-side rendering, Storefy provide
`customContext` function to create your own `useStorefy` hooks that it will
depends on your custom context.

```js
// store.jsx
import { createContext, render } from 'react' // or preact

import { Storefy, StoreonModufy } from 'storefy'
import { customContext } from 'storefy/react' // or storefy/preact

const store = …

const CustomContext = createContext(store)

// useStorefy will automatically recognize your storefy store and event types
export const useStorefy = customContext(CustomContext)

render(
  <CustomContext.Provider value={store}>
    <Counter />
  </CustomContext.Provider>,
  document.body
)
```

```js
// children.jsx
import { useStorefy } from '../store'

const Counter = () => {
  const { dispatch, count } = useStorefy('count')

  dispatch('set', 100)
  …
}
```


## Testing

Tests for store can be written in this way:

```js
it('creates users', () => {
  let addUserResolve
  jest.spyOn(api, 'addUser').mockImplementation(() => new Promise(resolve => {
    addUserResolve = resolve
  }))
  let store = Storefy([usersModule])

  store.dispatch('users/add', { name: 'User' })
  expect(api.addUser).toHaveBeenCalledWith({ name: 'User' })
  expect(store.get().users).toEqual([])

  addUserResolve()
  expect(store.get().users).toEqual([{ name: 'User' }])
})
```

We recommend to keep business logic away from the components. In this case,
UI kit (special page with all your components in all states)
will be the best way to test components.

For instance, with [UIBook] you can mock store and show notification
on any `dispatch` call.

[UIBook]: https://github.com/vrizo/uibook/
[Size Limit]: https://github.com/ai/size-limit
