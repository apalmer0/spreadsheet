import React from 'react'

import { selectors } from './store'
import { useAppSelector } from './hooks'
import { Title } from './components/Title'
import { Workbook } from './components/Workbook'
import './App.scss'

function App() {
  const activeCell = useAppSelector(selectors.selectActiveCell)

  return (
    <div className="container">
      <Title />
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
