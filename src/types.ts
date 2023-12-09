export interface ICell {
  col: string
  formula?: string
  location: string
  row: string
  value?: string
}

export type TWorkbook = Record<string, ICell>
