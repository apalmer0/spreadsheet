import { store } from './store'

export interface ICell {
  col: string
  formula: string
  inputs: string[]
  location: string
  outputs: string[]
  row: number
  valid: boolean
  value: string
}

export type TWorkbook = Record<string, ICell>

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
