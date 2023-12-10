import { ICell } from './types'

export const COL_COUNT = 25
export const ROW_COUNT = 100
export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const blankCell: ICell = {
  col: '',
  formula: '',
  location: '',
  row: '',
  value: '',
}

export const COLS = new Array(COL_COUNT).fill(0).map((_, i) => LETTERS[i])
export const ROWS = new Array(ROW_COUNT).fill(0).map((_, i) => i)
export const WORKBOOK: ICell[][] = ROWS.map((row) => {
  const rowNumber = row + 1

  return COLS.map((col) => {
    return {
      ...blankCell,
      col,
      location: `${col}${rowNumber}`,
      row: rowNumber.toString(),
    }
  })
})
