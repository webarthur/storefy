// let { delay } = require('nanodelay')

let { Storefy } = require('../')

it('applies modules', () => {
  let store1, store2
  function module1 (arg) {
    store1 = arg
  }
  function module2 (arg) {
    store2 = arg
  }

  let store = Storefy(module1, module2)
  expect(store1).toBe(store)
  expect(store2).toBe(store)
})

it('allows false as module', () => {
  Storefy(false)
})

it('fires @init', () => {
  let fired = 0
  function module1 (store) {
    store.on('@init', () => {
      fired += 1
    })
  }

  Storefy(module1)
  expect(fired).toEqual(1)
})

it('has empty object in state by default', () => {
  let store = Storefy()
  expect(store.get()).toEqual({})
})

it('changes state in event listener', () => {
  function init (store) {
    store.on('@init', () => ({ a: 0, c: 0 }))
  }
  let store = Storefy(init)
  store.on('test', (state, data) => {
    expect(store.get()).toEqual(state)
    expect(data).toEqual('a')
    return { a: 1 }
  })
  store.on('test', () => ({ b: 2 }))
  let calls = 0
  store.on('@changed', (state, changed) => {
    expect(changed).toEqual({ a: 1, b: 2 })
    expect(store.get()).toEqual(state)
    expect(state).toEqual({ a: 1, b: 2, c: 0 })
    calls += 1
  })

  store.dispatch('test', 'a')
  expect(calls).toEqual(1)
  expect(store.get()).toEqual({ a: 1, b: 2, c: 0 })
})

it('changes state immutably', () => {
  let store = Storefy()
  store.on('test', () => ({ b: 2 }))

  let state1 = store.get()
  store.dispatch('test')
  let state2 = store.get()

  expect(state1).toEqual({})
  expect(state2).toEqual({ b: 2 })
})

it('unbinds event listeners', () => {
  let store = Storefy()
  let fired = 0
  let unbind = store.on('test', () => {
    fired += 1
  })

  unbind()
  store.dispatch('test')
  expect(fired).toEqual(0)
})

it('notifies about new event', () => {
  let events = []
  function testCallback (state, data) {
    if (data === 1) {
      return { test: 1 }
    } else {
      return undefined
    }
  }
  function module (a) {
    a.on('@dispatch', (state, e) => {
      events.push(e)
    })
    a.on('test', testCallback)
  }

  let store = Storefy(module)
  store.dispatch('test', 1)
  store.dispatch('test', 2)

  expect(events).toEqual([
    ['@init', undefined, undefined],
    ['test', 1, [testCallback]],
    ['@changed', { test: 1 }, undefined],
    ['test', 2, [testCallback]]
  ])
})

it('allows Symbol as a store key', () => {
  let a = Symbol('a')

  function init (store) {
    store.on('@init', () => ({ [a]: 0 }))
  }
  let store = Storefy(init)
  store.on('test', () => ({ [a]: 1 }))

  store.dispatch('test', 'a')
  expect(store.get()[a]).toBe(1)
})

it('allows Symbol as an event name', () => {
  let inc = Symbol('inc')

  function init (store) {
    store.on('@init', () => ({ a: 0 }))
  }
  let store = Storefy(init)
  store.on(inc, () => ({ a: 1 }))

  store.dispatch(inc, 'a')
  expect(store.get().a).toBe(1)
})

it('does not fire @change if Promise is returned', () => {
  let store = Storefy()

  return new Promise(resolve => {
    store.on('inc', (state, data) => {
      expect(data).toBe(10)
      resolve()
    })

    let count = 0
    store.on('@changed', () => {
      count += 1
    })

    store.on('incAsync', () => {
      return new Promise(resolve => {
        setTimeout(() => {
          store.dispatch('inc', 10)
          resolve()
        }, 500)
      })
      // await delay(500)
      // store.dispatch('inc', 10)
    })

    store.dispatch('incAsync')
    expect(count).toBe(0)
  })
})
