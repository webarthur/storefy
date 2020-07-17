let { Storefy } = require('../')

it('initial state', () => {
  let store = Storefy({ count: 10 })
  let count = store.get('count')
  expect(count).toBe(10)
})

it('initial state 2', () => {
  let store = Storefy(function (store) {
    store.on('@init', { count: 10 })
  })
  let count = store.get('count')
  expect(count).toBe(10)
})
