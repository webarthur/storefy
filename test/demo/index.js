let { useCallback, Fragment, createElement: h } = require('react')
let { render } = require('react-dom')

let { StorefyDevtools, StorefyLogger } = require('../../devtools')
let { StoreContext, useStorefy } = require('../../react')
let { Storefy } = require('../../')

function counter1 (store) {
  store.on('@init', () => ({ count1: 0 }))
  store.on('inc1', state => ({ count1: state.count1 + 1 }))
}

function counter2 (store) {
  store.on('@init', () => ({ count2: 0 }))
  store.on('inc2', state => ({ count2: state.count2 + 1 }))
}

function tracker (text) {
  let hue = Math.round(255 * Math.random())
  return h(
    'div',
    {
      className: 'tracker',
      style: { backgroundColor: `hsla(${hue}, 50%, 50%, 0.2)` }
    },
    text
  )
}

function Button1 () {
  let { dispatch } = useStorefy()
  let onClick = useCallback(() => {
    dispatch('inc1')
  })
  return h('button', { onClick }, 'Increase counter 1')
}

function Button2 () {
  let { dispatch } = useStorefy()
  let onClick = useCallback(() => {
    dispatch('inc2')
  })
  return h('button', { onClick }, 'Increase counter 2')
}

function Tracker1 () {
  let { count1 } = useStorefy('count1')
  return tracker(`Counter 1: ${count1}`)
}

function Tracker2 () {
  let { count2 } = useStorefy('count2')
  return tracker(`Counter 2: ${count2}`)
}

function Tracker12 () {
  let { count1, count2 } = useStorefy('count1', 'count2')
  return tracker(`Counter 1: ${count1}, counter 2: ${count2}`)
}

function App () {
  return h(
    Fragment,
    null,
    h('div', { className: 'buttons' }, h(Button1), h(Button2)),
    h(Tracker1),
    h(Tracker2),
    h(Tracker12)
  )
}

let store = Storefy(
  counter1,
  counter2,
  StorefyLogger,
  StorefyDevtools()
)

render(
  h(StoreContext.Provider, { value: store }, h(App)),
  document.querySelector('main')
)
