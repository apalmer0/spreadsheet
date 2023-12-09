export interface ICell {
  row: string
  col: string
  width: number
  height: number
  value?: string
  reference?: ICell
}
