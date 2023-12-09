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

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
