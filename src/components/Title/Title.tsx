import React, { useState } from 'react'

import { useAppDispatch, useAppSelector } from '../../hooks'
import './Title.scss'
import { actions } from '../../store'

export const Title: React.FC = () => {
  const dispatch = useAppDispatch()
  const name = useAppSelector((state) => state.workbook.name)
  const [editing, setEditing] = useState(false)
  const [tempName, setTempName] = useState(name)

  const saveName = () => {
    dispatch(actions.setWorkbookName(tempName))
    setEditing(false)
  }

  return (
    <div className="title">
      {editing ? (
        <input
          type="text"
          className="title-input"
          autoFocus
          onBlur={() => setEditing(false)}
          onChange={(e) => {
            setTempName(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Tab') {
              saveName()
            }
            if (e.key === 'Escape') {
              setTempName(name)
              setEditing(false)
            }
          }}
          value={tempName}
        />
      ) : (
        <div className="title-input" onClick={() => setEditing(true)}>
          {name}
        </div>
      )}
    </div>
  )
}
