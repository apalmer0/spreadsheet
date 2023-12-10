import React from 'react'

import { actions, selectors } from './store'
import { useAppDispatch, useAppSelector } from './hooks'
import { Workbook } from './components/Workbook'
import './App.scss'

function App() {
  const dispatch = useAppDispatch()
  const activeCell = useAppSelector(selectors.selectActiveCell)

  const unselect = () => dispatch(actions.setActiveCellLocation(''))

  return (
    <div className="container">
      <div className="title" onClick={unselect}>
        <h1>Sheet</h1>
      </div>
      <div className="tools">Tools</div>
      <div className="formula-row">
        <div className="location">{activeCell?.location}</div>
        <div className="formula">{activeCell?.formula}</div>
      </div>
      <Workbook />
    </div>
  )
}

export default App
