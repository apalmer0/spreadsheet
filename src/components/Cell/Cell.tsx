import React, { useState, useEffect } from 'react'
import classNames from 'classnames'

import {
  setActiveCellLocation,
  updateCell,
} from '../../store/slices/workbookSlice'
import { useAppDispatch, useAppSelector } from '../../hooks'

interface IProps {
  cellLocation: string
  selected: boolean
}

export const Cell: React.FC<IProps> = React.memo(
  ({ cellLocation, selected = false }) => {
    const cell = useAppSelector((s) => s.workbook.workbook[cellLocation])
    const inputRef = React.useRef<HTMLInputElement>(null)
    const dispatch = useAppDispatch()

    const [value, setValue] = useState(cell.value)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value)
    }

    const persistChange = () => {
      dispatch(
        updateCell({
          ...cell,
          value,
        }),
      )
    }

    const setSelected = () => {
      dispatch(setActiveCellLocation(cell.location))
    }

    useEffect(() => {
      if (selected && inputRef.current) {
        inputRef.current.focus()
      }
    }, [selected])

    return (
      <td
        key={cell.col}
        className={classNames('workbook-cell-outer', {
          'workbook-cell-outer--selected': selected,
        })}
      >
        {selected ? (
          <input
            className={classNames('workbook-cell-inner', {
              'workbook-cell-inner--selected': selected,
            })}
            ref={inputRef}
            onChange={handleChange}
            onBlur={persistChange}
            type="text"
            value={value}
          />
        ) : (
          <div className="workbook-cell-inner" onClick={setSelected}>
            {cell.value}
          </div>
        )}
      </td>
    )
  },
  (prevProps, nextProps) => prevProps?.selected === nextProps?.selected,
)
