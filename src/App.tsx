import React from 'react'

import { Workbook } from './components/Workbook'
import './App.css'

function App() {
  return (
    <div className="container">
      <div className="title">
        <h1>Sheet</h1>
      </div>
      <div className="tools">Tools</div>
      <Workbook />
    </div>
  )
}

export default App
