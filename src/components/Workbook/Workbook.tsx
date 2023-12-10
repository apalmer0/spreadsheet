import React from 'react'
import classNames from 'classnames'

import { COLS, WORKBOOK } from '../../constants'
import { Cell } from '../Cell'
import { selectors } from '../../store'
import { useAppSelector } from '../../hooks'
import './Workbook.scss'

export const Workbook: React.FC = () => {
  const activeCellLocation = useAppSelector(
    (s) => s.workbook.activeCellLocation,
  )
  const activeCol = useAppSelector(selectors.selectActiveCol)
  const activeRow = useAppSelector(selectors.selectActiveRow)

  return (
    <div className="workbook-container">
      <table className="workbook">
        <thead>
          <tr>
            <th />
            {COLS.map((col) => (
              <th
                key={col}
                className={classNames('col-header', {
                  'col-header--selected': activeCol === col,
                })}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {WORKBOOK.map((row, rowIndex) => (
            <tr key={rowIndex}>
              <th
                className={classNames('row-header', {
                  'row-header--selected': activeRow?.toString() === row[0].row,
                })}
              >
                {row[0].row}
              </th>
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
