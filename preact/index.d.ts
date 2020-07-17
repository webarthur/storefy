import {
  PreactContext,
  ComponentType,
  FunctionalComponent,
  Context
} from 'preact'

import { StorefyStore, StorefyDispatch } from '..'

declare namespace useStorefy {
  export type StoreData<State extends object = {}, EventsMap = any> = {
    dispatch: StorefyDispatch<EventsMap>
  } & State
}

/**
 * Hook to use Storefy in functional React component.
 *
 * ```js
 * import { useStorefy } from 'Storefy/preact'
 * const Counter = () => {
 *   const { dispatch, count } = useStorefy('count')
 *   return <div>
 *     {count}
 *     <button onClick={() => dispatch('inc')}
 *   </div>
 * }
 * ```
 *
 * @param keys List of state’s field.
 * @returns The selected part of the state.
 */
export function useStorefy<State extends object = {}, EventsMap = any>(
  ...keys: (keyof State)[]
): useStorefy.StoreData<State, EventsMap>

/**
 * Higher-order function to let user create their own custom hooks in case of server-side rendering
 *
 * ```js
 * // Parent component
 * import { CreateContext } from 'react'
 * import { customContext } from 'Storefy/react'
 *
 * const CustomContext = CreateContext(Storefy)
 *
 * export const useStorefy = customContext(CustomContext)
 *
 * const Component = props => {
 *   return (
 *     <CustomContext>
 *       {props.children}
 *     </CustomContext>
 *   )
 * }
 * ```
 *
 * ```js
 * // Children component
 * import { useStorefy } from './parent'
 *
 * const Counter = () => {
 *   const { dispatch, count } = useStorefy('count')
 *   return <div>
 *     {count}
 *     <button onClick={() => dispatch('inc')}
 *   </div>
 * }
 * ```
 *
 * @param context User's owned React context
 * @returns useStorefy hooks that attatched to User's React context
 */
export function customContext<
  State extends object = {},
  EventsMap = any
>(context: Context<StorefyStore<State, EventsMap>>):
  (...keys: (keyof State)[]) => useStorefy.StoreData<State, EventsMap>

/**
 * Context to put store for `connect` decorator.
 *
 * ```js
 * import { StoreContext } from 'Storefy/preact'
 * render(
 *   <StoreContext.Provider value={store}><App /></StoreContext.Provider>,
 *   document.body
 * )
 * ```
 */
export const StoreContext: PreactContext<StorefyStore>

declare namespace connectStorefy {
  export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
  export type ConnectedComponent<ComponentProps> = FunctionalComponent<
    Partial<Omit<ComponentProps, "dispatch">>
  >
}
/**
 * Connect Preact components to the store.
 *
 * ```typescript
 * import { connectStorefy } from 'Storefy/preact'
 * const Counter = ({ count, dispatch }) => {
 *   return <div>
 *     {count}
 *     <button onClick={() => dispatch('inc')}
 *   </div>
 * }
 * export default connectStorefy('count', Counter)
 * ```
 *
 * @returns Wrapped component.
 */
export function connectStorefy<ComponentProps>(
  ...keysOrComponent: Array<PropertyKey | ComponentType<ComponentProps>>
): connectStorefy.ConnectedComponent<ComponentProps>
