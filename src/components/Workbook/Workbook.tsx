import React from 'react'

import { COLS, ROWS } from '../../constants'
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
          {ROWS.map((row) => (
            <tr key={row}>
              <th>{row}</th>
              {COLS.map((col) => (
                <td key={col} className="workbook-cell-outer">
                  <input className="workbook-cell-inner" type="text" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
