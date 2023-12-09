import React, { useState, useEffect, useCallback, useRef } from 'react'
import classNames from 'classnames'

import { actions } from '../../store/slices/workbookSlice'
import { useAppDispatch, useAppSelector } from '../../hooks'

interface IProps {
  cellLocation: string
  selected: boolean
}

export const Cell: React.FC<IProps> = React.memo(
  ({ cellLocation, selected = false }) => {
    const inputRef = useRef<HTMLInputElement>(null)

    const cell = useAppSelector((s) => s.workbook.workbook[cellLocation])

    const dispatch = useAppDispatch()
    console.log('cell render')

    const [value, setValue] = useState(cell.formula || '')
    const [focused, setFocused] = useState(false)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value)
    }

    const persistChange = useCallback(() => {
      if (value && value[0] === '=') {
        dispatch(actions.updateCellFormula({ ...cell, formula: value }))
      } else {
        dispatch(actions.updateCellValue({ ...cell, value }))
      }
    }, [cell, dispatch, value])

    const setSelected = () => {
      dispatch(actions.setActiveCellLocation(cell.location))
    }

    useEffect(() => {
      if (selected && inputRef.current) {
        inputRef.current.focus()
        if (!focused) {
          inputRef.current.setSelectionRange(value.length, value.length)
          setFocused(true)
        }
      }
    }, [selected, value.length, focused])

    useEffect(() => {
      const down = (e: any) => {
        if (!selected) return

        if (e.key === 'Enter') {
          e.preventDefault()
          persistChange()
          dispatch(actions.selectDown())
        } else if (e.key === 'Tab' && !e.shiftKey) {
          e.preventDefault()
          persistChange()
          dispatch(actions.selectRight())
        } else if (e.key === 'Tab' && e.shiftKey) {
          e.preventDefault()
          persistChange()
          dispatch(actions.selectLeft())
        } else if (e.key === 'ArrowUp') {
          e.preventDefault()
          persistChange()
          dispatch(actions.selectUp())
        } else if (e.key === 'ArrowRight') {
          e.preventDefault()
          persistChange()
          dispatch(actions.selectRight())
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          persistChange()
          dispatch(actions.selectDown())
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault()
          persistChange()
          dispatch(actions.selectLeft())
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setValue(cell.formula || '')
        }
      }

      document.addEventListener('keydown', down)
      return () => {
        document.removeEventListener('keydown', down)
      }
    }, [dispatch, persistChange, cell.formula, selected])

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
            onBlur={() => {
              persistChange()
              setFocused(true)
            }}
            ref={inputRef}
            onChange={handleChange}
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
