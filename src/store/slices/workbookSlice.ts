import { createSelector, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { ICell, RootState, TWorkbook } from '../../types'
import { COL_COUNT, LETTERS, ROW_COUNT, WORKBOOK } from '../../constants'
import {
  calculateValue,
  getCycleElements,
  getInputLocations,
} from '../../components/Cell/utils'

export type WorkbookState = {
  activeCellLocation?: string
  name: string
  workbook: TWorkbook
}

const initialWorkbook: TWorkbook = {}

WORKBOOK.forEach((row) => {
  row.forEach((cell) => {
    initialWorkbook[cell.location] = cell
  })
})

const initialState: WorkbookState = {
  activeCellLocation: undefined,
  name: 'Untitled Workbook',
  workbook: initialWorkbook,
}

// naive implementation - ignores order of cell updates. need to
// perform topological sort to get the correct order
// need to detect circular references too
const updateReferences = (cell: ICell, workbook: TWorkbook) => {
  cell.outputs.forEach((outputCellLocation) => {
    const cell = workbook[outputCellLocation]

    const calculatedValue = calculateValue(cell, workbook)

    workbook[outputCellLocation] = {
      ...cell,
      value: calculatedValue,
    }
    updateReferences(workbook[outputCellLocation], workbook)
  })
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
    updateCellFormula: (
      state,
      action: PayloadAction<{ cellLocation: string; newFormula: string }>,
    ) => {
      const { cellLocation, newFormula } = action.payload
      const cell = state.workbook[cellLocation]

      state.workbook[cellLocation] = {
        ...cell,
        formula: newFormula,
      }

      // 1. clear reciprocal references from input cells
      // clear reciprocal references from input cells - formula might no longer
      // have those cells as inputs, so they shouldn't include this cell as an output
      cell.inputs.forEach((inputLocation) => {
        const inputCell = state.workbook[inputLocation]
        const filteredOutputs = inputCell.outputs.filter(
          (cellReference) => cellReference !== cell.location,
        )
        state.workbook[inputLocation].outputs = filteredOutputs
        // inputCell.outputs = filteredOutputs
      })

      // 2. using new formula, re-establish input references
      const inputLocations = getInputLocations(newFormula, state.workbook)
      state.workbook[cellLocation].inputs = inputLocations

      // 3. update input cells to have the current cell as an output
      inputLocations.forEach((inputLocation) => {
        const currentOutputs = state.workbook[inputLocation].outputs

        if (!currentOutputs.includes(cell.location)) {
          state.workbook[inputLocation].outputs = [
            ...currentOutputs,
            cell.location,
          ]
        }
      })
    },
    calculateCellValue: (state, action: PayloadAction<string>) => {
      const cell = state.workbook[action.payload]

      if (!cell.valid) return
      if (!cell.formula) return

      const calculatedValue = calculateValue(cell, state.workbook)
      state.workbook[action.payload].value = calculatedValue
    },
    updateCellValue: (
      state,
      action: PayloadAction<{ cellLocation: string; newValue: string }>,
    ) => {
      const { cellLocation, newValue } = action.payload
      const cell = state.workbook[cellLocation]

      state.workbook[cellLocation] = {
        ...cell,
        formula: newValue.toString(),
        value: newValue,
      }
    },
    updateReferences: (state, action: PayloadAction<string>) => {
      const cell = state.workbook[action.payload]
      if (cell.valid) {
        updateReferences(state.workbook[action.payload], state.workbook)
      }
    },
    clearCycle: (state, action: PayloadAction<string>) => {
      const cell = state.workbook[action.payload]
      const cycles = getCycleElements(cell, state.workbook)

      cycles.forEach((cellLocation) => {
        state.workbook[cellLocation] = {
          ...state.workbook[cellLocation],
          valid: true,
        }
      })
    },
    detectCycle: (state, action: PayloadAction<string>) => {
      const cell = state.workbook[action.payload]
      const cycles = getCycleElements(cell, state.workbook)

      cycles.forEach((cell) => {
        state.workbook[cell] = {
          ...state.workbook[cell],
          valid: false,
        }
      })
    },
    resetCell: (state, action: PayloadAction<string>) => {
      const cell = state.workbook[action.payload]

      // remove this cell from the outputs of its input cells
      cell.inputs.forEach((inputLocation) => {
        const currentOutputs = state.workbook[inputLocation].outputs
        const filteredOutputs = currentOutputs.filter(
          (cellReference) => cellReference !== cell.location,
        )
        state.workbook[inputLocation].outputs = filteredOutputs
      })

      state.workbook[action.payload] = {
        ...cell,
        formula: '',
        inputs: [],
        value: '',
      }
    },
    selectUp: (state) => {
      if (!state.activeCellLocation) return
      const { col, row } = state.workbook[state.activeCellLocation]
      const prevRow = row - 1

      if (prevRow < 1) return

      state.activeCellLocation = `${col}${prevRow}`
    },
    selectTop: (state) => {
      if (!state.activeCellLocation) return
      const { col } = state.workbook[state.activeCellLocation]

      state.activeCellLocation = `${col}${1}`
    },
    selectRight: (state) => {
      if (!state.activeCellLocation) return
      const { col, row } = state.workbook[state.activeCellLocation]
      const nextColIndex = LETTERS.indexOf(col) + 1

      if (nextColIndex > COL_COUNT) return

      const nextCol = LETTERS[nextColIndex]

      state.activeCellLocation = `${nextCol}${row}`
    },
    selectLast: (state) => {
      if (!state.activeCellLocation) return
      const { row } = state.workbook[state.activeCellLocation]
      const lastCol = LETTERS[COL_COUNT - 1]

      state.activeCellLocation = `${lastCol}${row}`
    },
    selectLeft: (state) => {
      if (!state.activeCellLocation) return
      const { col, row } = state.workbook[state.activeCellLocation]
      const prevCol = LETTERS[LETTERS.indexOf(col) - 1]

      if (!prevCol) return

      state.activeCellLocation = `${prevCol}${row}`
    },
    selectFirst: (state) => {
      if (!state.activeCellLocation) return
      const { row } = state.workbook[state.activeCellLocation]

      state.activeCellLocation = `A${row}`
    },
    selectDown: (state) => {
      if (!state.activeCellLocation) return
      const { col, row } = state.workbook[state.activeCellLocation]
      const nextRow = row + 1

      if (nextRow > ROW_COUNT) return

      state.activeCellLocation = `${col}${nextRow}`
    },
    selectBottom: (state) => {
      if (!state.activeCellLocation) return
      const { col } = state.workbook[state.activeCellLocation]
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
    [
      (state: RootState) => state.workbook.activeCellLocation,
      (state: RootState) => state.workbook.workbook,
    ],
    (activeCellLocation, workbook) => {
      if (!activeCellLocation) return undefined
      return workbook[activeCellLocation].col
    },
  ),
  selectActiveRow: createSelector(
    [
      (state: RootState) => state.workbook.activeCellLocation,
      (state: RootState) => state.workbook.workbook,
    ],
    (activeCellLocation, workbook) => {
      if (!activeCellLocation) return undefined
      return workbook[activeCellLocation].row
    },
  ),
}

export const { actions, reducer } = workbookSlice
