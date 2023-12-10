import { store } from './store'

export interface ICell {
  col: string
  formula?: string
  location: string
  row: string
  value?: string
}

export type TWorkbook = Record<string, ICell>

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
