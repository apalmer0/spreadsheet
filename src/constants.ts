import { ICell } from './types'

const COL_COUNT = 25
const ROW_COUNT = 100
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const blankCell: ICell = {
  col: '',
  height: 25,
  id: '',
  reference: undefined,
  row: '',
  value: undefined,
  width: 100,
}

export const COLS = new Array(COL_COUNT).fill(0).map((_, i) => LETTERS[i])
const ROWS = new Array(ROW_COUNT).fill(0).map((_, i) => i)
export const WORKBOOK: ICell[][] = ROWS.map((row) => {
  const rowNumber = row + 1

  return COLS.map((col) => {
    return {
      ...blankCell,
      col,
      id: `${col}${rowNumber}`,
      row: rowNumber.toString(),
    }
  })
})
