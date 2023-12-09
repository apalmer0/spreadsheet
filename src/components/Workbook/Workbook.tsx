import React from 'react'

import { COLS, WORKBOOK } from '../../constants'
import './Workbook.css'

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
          {WORKBOOK.map((row, rowIndex) => {
            return (
              <tr key={rowIndex}>
                <th>{rowIndex}</th>
                {row.map((cell) => {
                  return (
                    <td key={cell.col} className="workbook-cell-outer">
                      <input className="workbook-cell-inner" type="text" />
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
