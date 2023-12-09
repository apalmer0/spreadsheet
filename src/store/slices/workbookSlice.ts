import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { ICell } from '../../types'
import { COL_COUNT, LETTERS, ROW_COUNT, WORKBOOK } from '../../constants'

export type WorkbookState = {
  activeCellLocation?: string
  workbook: Record<string, ICell>
}

const workbook: Record<string, ICell> = {}

WORKBOOK.forEach((row) => {
  row.forEach((cell) => {
    workbook[cell.location] = cell
  })
})

const initialState: WorkbookState = {
  activeCellLocation: undefined,
  workbook,
}

const getLocationValues = (location: string): [string, number] => {
  const col = location.match(/[a-zA-Z]+/g)![0]
  const row = parseInt(location.match(/\d+/g)![0], 10)

  return [col, row]
}

export const workbookSlice = createSlice({
  name: 'workbook',
  initialState,
  reducers: {
    setActiveCellLocation: (state, action: PayloadAction<string>) => {
      state.activeCellLocation = action.payload
    },
    updateCell: (state, action: PayloadAction<ICell>) => {
      state.workbook[action.payload.location] = action.payload
    },
    selectUp: (state) => {
      if (!state.activeCellLocation) return

      const [col, row] = getLocationValues(state.activeCellLocation)
      const prevRow = row - 1

      if (prevRow < 1) return

      state.activeCellLocation = `${col}${prevRow}`
    },
    selectRight: (state) => {
      if (!state.activeCellLocation) return

      const [col, row] = getLocationValues(state.activeCellLocation)
      const nextColIndex = LETTERS.indexOf(col) + 1

      if (nextColIndex > COL_COUNT) return

      const nextCol = LETTERS[nextColIndex]

      state.activeCellLocation = `${nextCol}${row}`
    },
    selectLeft: (state) => {
      if (!state.activeCellLocation) return

      const [col, row] = getLocationValues(state.activeCellLocation)
      const prevCol = LETTERS[LETTERS.indexOf(col) - 1]

      if (!prevCol) return

      state.activeCellLocation = `${prevCol}${row}`
    },
    selectDown: (state) => {
      if (!state.activeCellLocation) return

      const [col, row] = getLocationValues(state.activeCellLocation)
      const nextRow = row + 1

      if (nextRow > ROW_COUNT) return

      state.activeCellLocation = `${col}${nextRow}`
    },
  },
})

// Action creators are generated for each case reducer function
export const {
  selectDown,
  selectLeft,
  selectRight,
  selectUp,
  setActiveCellLocation,
  updateCell,
} = workbookSlice.actions

export default workbookSlice.reducer
