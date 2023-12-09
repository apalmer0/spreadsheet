import React from 'react'

import { COLS, WORKBOOK } from '../../constants'
import { Cell } from '../Cell'
import { useAppSelector } from '../../hooks'
import './Workbook.scss'

export const Workbook: React.FC = () => {
  const activeCellLocation = useAppSelector(
    (s) => s.workbook.activeCellLocation,
  )

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
                <Cell
                  cellLocation={cell.location}
                  selected={activeCellLocation === cell.location}
                  key={cell.col}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
