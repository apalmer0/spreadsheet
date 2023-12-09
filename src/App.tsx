import React from 'react'

import { Workbook } from './components/Workbook'
import './App.css'
import { useAppDispatch } from './hooks'
import { actions } from './store'

function App() {
  const dispatch = useAppDispatch()

  const unselect = () => dispatch(actions.setActiveCellLocation(''))

  return (
    <div className="container">
      <div className="title" onClick={unselect}>
        <h1>Sheet</h1>
      </div>
      <div className="tools">Tools</div>
      <Workbook />
    </div>
  )
}

export default App
