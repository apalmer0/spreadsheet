import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { ICell, RootState, TWorkbook } from '../../types'
import { COL_COUNT, LETTERS, ROW_COUNT, WORKBOOK } from '../../constants'
import { calculateValue } from '../../components/Cell/utils'

export type WorkbookState = {
  activeCellLocation?: string
  name: string
  workbook: TWorkbook
}

const workbook: TWorkbook = {}

WORKBOOK.forEach((row) => {
  row.forEach((cell) => {
    workbook[cell.location] = cell
  })
})

const initialState: WorkbookState = {
  activeCellLocation: undefined,
  name: 'Untitled Workbook',
  workbook,
}

const getCol = (location: string): string => {
  return location.match(/[a-zA-Z]+/g)![0]
}

const getRow = (location: string): number => {
  return parseInt(location.match(/\d+/g)![0], 10)
}

const getLocationValues = (location: string): [string, number] => {
  const col = getCol(location)
  const row = getRow(location)

  return [col, row]
}

export const workbookSlice = createSlice({
  name: 'workbook',
  initialState,
  reducers: {
    setWorkbookName: (state, action: PayloadAction<string>) => {
      state.name = action.payload
    },
    setActiveCellLocation: (state, action: PayloadAction<string>) => {
      state.activeCellLocation = action.payload
    },
    updateCellFormula: (state, action: PayloadAction<ICell>) => {
      const calculatedValue = calculateValue(
        action.payload,
        state.workbook,
      ).toString()
      state.workbook[action.payload.location] = {
        ...action.payload,
        formula: action.payload.formula,
        value: calculatedValue,
      }
    },
    updateCellValue: (state, action: PayloadAction<ICell>) => {
      state.workbook[action.payload.location] = {
        ...action.payload,
        formula: action.payload.value,
      }
    },
    selectUp: (state) => {
      if (!state.activeCellLocation) return

      const [col, row] = getLocationValues(state.activeCellLocation)
      const prevRow = row - 1

      if (prevRow < 1) return

      state.activeCellLocation = `${col}${prevRow}`
    },
    selectTop: (state) => {
      if (!state.activeCellLocation) return

      const [col] = getLocationValues(state.activeCellLocation)

      state.activeCellLocation = `${col}${1}`
    },
    selectRight: (state) => {
      if (!state.activeCellLocation) return

      const [col, row] = getLocationValues(state.activeCellLocation)
      const nextColIndex = LETTERS.indexOf(col) + 1

      if (nextColIndex > COL_COUNT) return

      const nextCol = LETTERS[nextColIndex]

      state.activeCellLocation = `${nextCol}${row}`
    },
    selectLast: (state) => {
      if (!state.activeCellLocation) return

      const [_, row] = getLocationValues(state.activeCellLocation)
      const lastCol = LETTERS[COL_COUNT - 1]

      state.activeCellLocation = `${lastCol}${row}`
    },
    selectLeft: (state) => {
      if (!state.activeCellLocation) return

      const [col, row] = getLocationValues(state.activeCellLocation)
      const prevCol = LETTERS[LETTERS.indexOf(col) - 1]

      if (!prevCol) return

      state.activeCellLocation = `${prevCol}${row}`
    },
    selectFirst: (state) => {
      if (!state.activeCellLocation) return

      const [_, row] = getLocationValues(state.activeCellLocation)

      state.activeCellLocation = `A${row}`
    },
    selectDown: (state) => {
      if (!state.activeCellLocation) return

      const [col, row] = getLocationValues(state.activeCellLocation)
      const nextRow = row + 1

      if (nextRow > ROW_COUNT) return

      state.activeCellLocation = `${col}${nextRow}`
    },
    selectBottom: (state) => {
      if (!state.activeCellLocation) return

      const [col] = getLocationValues(state.activeCellLocation)
      const lastRow = ROW_COUNT

      state.activeCellLocation = `${col}${lastRow}`
    },
  },
})

export const selectors = {
  selectActiveCell: createSelector(
    [
      (state: RootState) => state.workbook.activeCellLocation,
      (state: RootState) => state.workbook.workbook,
    ],
    (activeCellLocation, workbook) => {
      if (!activeCellLocation) return undefined
      return workbook[activeCellLocation]
    },
  ),
  selectActiveCol: createSelector(
    [(state: RootState) => state.workbook.activeCellLocation],
    (activeCellLocation) => {
      if (!activeCellLocation) return undefined
      return getCol(activeCellLocation)
    },
  ),
  selectActiveRow: createSelector(
    [(state: RootState) => state.workbook.activeCellLocation],
    (activeCellLocation) => {
      if (!activeCellLocation) return undefined
      return getRow(activeCellLocation)
    },
  ),
}

export const { actions, reducer } = workbookSlice
