let { StorefyDevtools } = require('../devtools')
let { Storefy } = require('../')

function mockDevTools () {
  let store
  let subscribeCb
  let actions = []

  let reduxTool = {
    init (state) {
      store = state
    },
    send (action, state) {
      actions.push(action)
      store = state
    },
    subscribe (cb) {
      subscribeCb = cb
    }
  }

  return {
    connect () {
      return reduxTool
    },
    store () {
      return store
    },
    devToolDispatch (message) {
      if (subscribeCb) subscribeCb(message)
    },
    actions () {
      return actions
    }
  }
}

function counter (store) {
  store.on('@init', () => ({ count: 0, started: true }))
  store.on('inc', (state, value) => ({ count: state.count + value }))
}

beforeEach(() => {
  global.__REDUX_DEVTOOLS_EXTENSION__ = mockDevTools()
})

afterEach(() => {
  global.__REDUX_DEVTOOLS_EXTENSION__ = undefined
})

it('initiates with data from store', () => {
  let store = Storefy(counter, StorefyDevtools())
  let getDevtoolStore = global.__REDUX_DEVTOOLS_EXTENSION__.store
  expect(getDevtoolStore()).toEqual(store.get())
})

it('supports old API', () => {
  let store = Storefy(counter, StorefyDevtools)
  let getDevtoolStore = global.__REDUX_DEVTOOLS_EXTENSION__.store
  expect(getDevtoolStore()).toEqual(store.get())
})

it('gets state updates from store', () => {
  let store = Storefy(counter, StorefyDevtools())
  let getDevtoolStore = global.__REDUX_DEVTOOLS_EXTENSION__.store

  expect(getDevtoolStore()).toEqual(store.get())
  store.dispatch('inc', 2)

  expect(getDevtoolStore()).toEqual(store.get())
})

it('gets events from store', () => {
  let store = Storefy(counter, StorefyDevtools())
  let getDevtoolsActions = global.__REDUX_DEVTOOLS_EXTENSION__.actions
  let initialState = { count: 0, started: true }
  let initialActions = [
    { type: '@init', payload: undefined },
    { type: '@changed', payload: initialState }
  ]
  expect(getDevtoolsActions()).toEqual(initialActions)

  let event = { action: 'inc', payload: 5 }
  store.dispatch(event.action, event.payload)
  expect(getDevtoolsActions()).toEqual(
    initialActions.concat([
      { type: event.action, payload: event.payload },
      { type: '@changed', payload: { count: event.payload } }
    ])
  )
})

it('is able to change store value', () => {
  let store = Storefy(counter, StorefyDevtools())
  let devToolDispatch = global.__REDUX_DEVTOOLS_EXTENSION__.devToolDispatch
  expect(store.get()).toEqual({ count: 0, started: true })

  let newState = { count: 10, started: false }
  devToolDispatch({ type: 'DISPATCH', state: JSON.stringify(newState) })
  expect(store.get()).toEqual(newState)
})

it('shows warning when devtool is not installed', () => {
  jest.spyOn(console, 'warn').mockImplementation(() => true)
  global.__REDUX_DEVTOOLS_EXTENSION__ = null

  Storefy(counter, StorefyDevtools())
  expect(console.warn).toHaveBeenCalledWith(
    'Please install Redux devtools extension\n' +
      'http://extension.remotedev.io/'
  )
})

it('throws on unknown not system events', () => {
  let store = Storefy(StorefyDevtools())
  let unbind = store.on('unknown2', () => {})
  unbind()

  expect(() => {
    store.dispatch('unknown1')
  }).toThrow('Unknown Storefy event unknown1')

  expect(() => {
    store.dispatch('unknown2')
  }).toThrow('Unknown Storefy event unknown2')

  store.dispatch('@unknown')
})
