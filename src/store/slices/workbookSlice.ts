import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { ICell } from '../../types'
import { WORKBOOK } from '../../constants'

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
  },
})

// Action creators are generated for each case reducer function
export const { setActiveCellLocation, updateCell } = workbookSlice.actions

export default workbookSlice.reducer
