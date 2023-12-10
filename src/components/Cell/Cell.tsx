import React, { useState, useEffect, useCallback, useRef } from 'react'
import classNames from 'classnames'

import { actions } from '../../store/slices/workbookSlice'
import { useAppDispatch, useAppSelector } from '../../hooks'
import { detectCycle } from './utils'
import './Cell.scss'

interface IProps {
  cellLocation: string
  selected: boolean
}

export const Cell: React.FC<IProps> = React.memo(
  ({ cellLocation, selected = false }) => {
    const dispatch = useAppDispatch()
    const inputRef = useRef<HTMLInputElement>(null)

    const cell = useAppSelector((s) => s.workbook.workbook[cellLocation])
    const workbook = useAppSelector((s) => s.workbook.workbook)

    const [value, setValue] = useState(cell.formula || '')
    const [focused, setFocused] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hovered, setHovered] = useState(false)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue(event.target.value)
    }

    const persistChange = useCallback(() => {
      const cycle = detectCycle(value, cell, workbook)

      if (cycle) {
        setError('Dependency cycle detected')
        return
      }

      setError(null)

      if (value && value[0] === '=') {
        dispatch(actions.updateCellFormula({ ...cell, formula: value }))
      } else {
        dispatch(actions.updateCellValue({ ...cell, formula: value, value }))
      }
      dispatch(actions.updateReferences(cellLocation))
      setFocused(false)
    }, [value, cell, workbook, dispatch, cellLocation])

    const setSelected = () => {
      dispatch(actions.setActiveCellLocation(cell.location))
    }

    useEffect(() => {
      setValue(cell.formula ?? '')
    }, [cell.formula])

    useEffect(() => {
      if (!inputRef.current) return

      if (focused) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(value.length, value.length)
      }
    }, [focused, value.length])

    useEffect(() => {
      const down = (e: any) => {
        if (!selected) return

        if (e.key === 'Enter') {
          e.preventDefault()
          if (!focused) {
            setFocused(true)
          } else {
            persistChange()
            dispatch(actions.selectDown())
          }
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
          if (e.metaKey || e.ctrlKey) {
            dispatch(actions.selectTop())
          } else {
            dispatch(actions.selectUp())
          }
        } else if (e.key === 'ArrowRight') {
          if (!focused) {
            e.preventDefault()
            persistChange()
            if (e.metaKey || e.ctrlKey) {
              dispatch(actions.selectLast())
            } else {
              dispatch(actions.selectRight())
            }
          }
        } else if (e.key === 'ArrowDown') {
          e.preventDefault()
          persistChange()
          if (e.metaKey || e.ctrlKey) {
            dispatch(actions.selectBottom())
          } else {
            dispatch(actions.selectDown())
          }
        } else if (e.key === 'ArrowLeft') {
          if (!focused) {
            e.preventDefault()
            persistChange()
            if (e.metaKey || e.ctrlKey) {
              dispatch(actions.selectFirst())
            } else {
              dispatch(actions.selectLeft())
            }
          }
        } else if (e.key === 'Escape') {
          e.preventDefault()
          setFocused(false)
          setValue(cell.formula || '')
        } else if (e.key === 'Backspace') {
          if (!focused) {
            e.preventDefault()
            dispatch(actions.resetCell(cellLocation))
          }
        } else {
          if (
            !focused &&
            (e.key === '=' ||
              (e.keyCode >= 48 && e.keyCode <= 57) ||
              (e.keyCode >= 65 && e.keyCode <= 90) ||
              (e.keyCode >= 97 && e.keyCode <= 122))
          ) {
            setValue('')
            setFocused(true)
          }
        }
      }

      document.addEventListener('keydown', down)
      return () => {
        document.removeEventListener('keydown', down)
      }
    }, [
      cell.formula,
      cellLocation,
      dispatch,
      focused,
      persistChange,
      selected,
      value,
    ])

    return (
      <td
        key={cell.col}
        className={classNames('workbook-cell-outer', {
          'workbook-cell-outer--selected': selected,
          'workbook-cell-outer--error': error,
        })}
      >
        {selected && focused ? (
          <input
            className={classNames('workbook-cell-inner', {
              'workbook-cell-inner--selected': selected,
              'workbook-cell-inner--error': error,
            })}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              persistChange()
              setFocused(false)
            }}
            ref={inputRef}
            onChange={handleChange}
            type="text"
            value={value}
          />
        ) : (
          <div
            className={classNames('workbook-cell-inner', {
              'workbook-cell-inner--selected': selected,
            })}
            onClick={setSelected}
            onMouseEnter={() => {
              if (!error) return
              setHovered(true)
            }}
            onMouseLeave={() => {
              if (!error) return
              setHovered(false)
            }}
          >
            {error ? '#REF' : cell.value}
            {hovered && error && (
              <div className="workbook-cell-error">{error}</div>
            )}
          </div>
        )}
      </td>
    )
  },
  (prevProps, nextProps) => prevProps?.selected === nextProps?.selected,
)
