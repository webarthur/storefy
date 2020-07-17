var Storefy = function () {
  var events = {}
  var state = {}

  var store = {

    dispatch: function (e, data) {
      if (e !== '@dispatch')
        store.dispatch('@dispatch', [e, data, events[e]])

      if (!events[e])
        return

      var changes = {}
      var changed
      events[e].forEach(function (fn) {
        var diff = fn(state, data)
        if (diff && typeof diff.then !== 'function') {
          changed = state = Object.assign({}, state, diff)
          changes = Object.assign({}, changes, diff)
        }
      })
      if (changed) store.dispatch('@changed', changes)
    },

    get: function (s) { return s ? state[s] : state },

    on: function (e, cb) {
      if (typeof cb === 'object') {
        var data = cb
        cb = function () { return data }
      }

      (events[e] || (events[e] = [])).push(cb)

      return function () {
        events[e] = events[e].filter(function (i) { return i !== cb })
      }
    }

  }

  for (var i = 0; i < arguments.length; i++)
    if (typeof arguments[i] === 'object')
      Object.assign(state, arguments[i])
    else if (arguments[i])
      arguments[i](store)

  store.dispatch('@init')

  return store
}

if (typeof module !== 'undefined')
  module.exports = { Storefy }
