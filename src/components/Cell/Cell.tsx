import React, { useState, useEffect, useCallback, useRef } from 'react'
import classNames from 'classnames'

import { actions } from '../../store/slices/workbookSlice'
import { useAppDispatch, useAppSelector } from '../../hooks'
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

    const [displayValue, setDisplayValue] = useState(cell.formula || '')
    const [focused, setFocused] = useState(false)
    const [cellInvalid, setCellInvalid] = useState(false)
    const [hovered, setHovered] = useState(false)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setDisplayValue(event.target.value)
    }

    const persistChange = useCallback(() => {
      if (displayValue && displayValue[0] === '=') {
        dispatch(actions.updateCellFormula({ ...cell, formula: displayValue }))
      } else {
        dispatch(
          actions.updateCellValue({
            ...cell,
            formula: displayValue,
            value: displayValue,
          }),
        )
      }
      dispatch(actions.updateReferences(cellLocation))
      setFocused(false)
    }, [displayValue, cell, dispatch, cellLocation])

    const setSelected = () => {
      dispatch(actions.setActiveCellLocation(cell.location))
    }

    useEffect(() => {
      setDisplayValue(cell.formula ?? '')
    }, [cell.formula])

    useEffect(() => {
      if (!inputRef.current) return

      if (focused) {
        inputRef.current.focus()
        inputRef.current.setSelectionRange(
          displayValue.length,
          displayValue.length,
        )
      }
    }, [focused, displayValue.length])

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
          setDisplayValue(cell.formula || '')
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
            setDisplayValue('')
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
      displayValue,
      focused,
      persistChange,
      selected,
    ])

    return (
      <td
        key={cell.col}
        className={classNames('workbook-cell-outer', {
          'workbook-cell-outer--selected': selected,
          'workbook-cell-outer--error': cellInvalid,
        })}
      >
        {selected && focused ? (
          <input
            className={classNames('workbook-cell-inner', {
              'workbook-cell-inner--selected': selected,
              'workbook-cell-inner--error': cellInvalid,
            })}
            onFocus={() => setFocused(true)}
            onBlur={() => {
              persistChange()
              setFocused(false)
            }}
            ref={inputRef}
            onChange={handleChange}
            type="text"
            value={displayValue}
          />
        ) : (
          <div
            className={classNames('workbook-cell-inner', {
              'workbook-cell-inner--selected': selected,
            })}
            onClick={setSelected}
            onMouseEnter={() => {
              if (!cellInvalid) return
              setHovered(true)
            }}
            onMouseLeave={() => {
              if (!cellInvalid) return
              setHovered(false)
            }}
          >
            {cellInvalid ? '#REF' : cell.value}
            {hovered && cellInvalid && (
              <div className="workbook-cell-cellInvalid">{cellInvalid}</div>
            )}
          </div>
        )}
      </td>
    )
  },
  (prevProps, nextProps) => prevProps?.selected === nextProps?.selected,
)
