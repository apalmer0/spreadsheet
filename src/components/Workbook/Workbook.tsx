import React from 'react'

import { COLS, WORKBOOK } from '../../constants'
import './Workbook.css'
import { Cell } from '../Cell'

export const Workbook: React.FC = () => {
  return (
    <div className="workbook-container">
      <table className="workbook">
        <thead>
          <tr>
            <th />
            {COLS.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WORKBOOK.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th>{row[0].row}</th>
              {row.map((cell) => (
                <Cell cell={cell} key={cell.col} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
