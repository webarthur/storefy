import { Storefy, StorefyModule, StorefyStore, StorefyEvents } from '..'

const sym = Symbol('sym')

interface State {
  a: number
  b: string
}

interface EventsDataTypesMap extends StorefyEvents<State> {
  [sym]: string
  'comment:posting': string
  'comment:posted': number
  'comment:post': number
  'comment:error': undefined
}

const init: StorefyModule<State, EventsDataTypesMap> = store => {
  store.on('@init', () => ({ a: 0, b: '' }))
}

function setUp(store: StorefyStore<State, EventsDataTypesMap>): void {
  // THROWS Argument of type '"inc"' is not assignable to parameter of type '"@dispatch" | "@init" | "@changed" | "comment:posting" | "comment:posted" | "comment:error" | "comment:post" | unique symbol'.
  store.on('inc', (state: State) => ({ a: state.a + 1 }))
}

const store = Storefy<State, EventsDataTypesMap>([
  init,
  setUp
])

// THROWS Argument of type '"inc"' is not assignable to parameter of type '"@dispatch" | "@init" | "@changed" | "comment:posting" | "comment:posted" | "comment:error" | "comment:post" | unique symbol'.
store.dispatch('inc', 1)

// THROWS Argument of type '(state: State, data: number) => { a: number; }' is not assignable to parameter of type 'EventHandler<State, EventsDataTypesMap, unique symbol>'.
store.on(sym, (state: State, data: number) => ({ a: state.a + data }))

// THROWS Argument of type '2' is not assignable to parameter of type 'string | undefined'.
store.dispatch(sym, 2)

// THROWS Argument of type 'true' is not assignable to parameter of type 'undefined'.
store.dispatch('comment:error', true)

const state = store.get()
state.a

interface WrongModuleEvents {
  'unknown': undefined
}
const init2: StorefyModule<State, WrongModuleEvents> = () => { }

// THROWS Type 'StorefyModule<State, WrongModuleEvents>' is not assignable to type 'false | StorefyModule<State, EventsDataTypesMap>'.
Storefy<State, EventsDataTypesMap>([init2])

interface WrongModuleEvents2 {
  'comment:posting': number
}
const init3: StorefyModule<State, WrongModuleEvents2> = () => {}

// THROWS Type 'StorefyModule<State, WrongModuleEvents2>' is not assignable to type 'false | StorefyModule<State, EventsDataTypesMap>'.
Storefy<State, EventsDataTypesMap>([init3])

// Lazy module
function postUp(store: StorefyStore<{a: number}, {'inc': string;}>): void {
    store.on('inc', (state) => ({ a: state.a + 1 }))
}

// THROWS Argument of type 'StorefyStore<State, EventsDataTypesMap>' is not assignable to parameter of type 'StorefyStore<{ a: number; }, { inc: string; }>'.
postUp(store);

let s1: StorefyStore<{}, {a: string}> = {} as any;
let s2: StorefyStore<{}, {a: string, b: number}> = {} as any;

// THROWS Type 'StorefyStore<{}, { a: string; }>' is not assignable to type 'StorefyStore<{}, { a: string; b: number; }>'.
s2 = s1;
s1.dispatch('a', '1')

let s3: StorefyStore<{a: string}> = {} as any;
let s4: StorefyStore<{a: string, b: number}> = {} as any;

// THROWS Type 'StorefyStore<{ a: string; }, any>' is not assignable to type 'StorefyStore<{ a: string; b: number; }, any>'.
s4 = s3;

store.on('@dispatch', (_, [event, data]) => {
  // THROWS This condition will always return 'false' since the types '"@dispatch" | "@init" | "@changed" | "comment:posting" | "comment:posted" | "comment:error" | "comment:post" | unique symbol' and '"abc"' have no overlap.
  if (event === 'abc') {
    console.log(data);
  }
})

s2.get()
s3.get().a
s4.get()
