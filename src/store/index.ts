import { configureStore } from '@reduxjs/toolkit'

import * as workbook from './slices/workbookSlice'

export const store = configureStore({
  reducer: {
    workbook: workbook.reducer,
  },
})

export const actions = {
  ...workbook.actions,
}

export const selectors = {
  ...workbook.selectors,
}
