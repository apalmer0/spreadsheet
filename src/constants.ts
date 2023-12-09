const COL_COUNT = 25
const ROW_COUNT = 100
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export const COLS = new Array(COL_COUNT).fill(0).map((_, i) => LETTERS[i])
export const ROWS = new Array(ROW_COUNT).fill(0).map((_, i) => i)
