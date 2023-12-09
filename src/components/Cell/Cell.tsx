import React, { useState } from 'react'
import { ICell } from '../../types'

interface IProps {
  cell: ICell
}

export const Cell: React.FC<IProps> = ({ cell }) => {
  console.log('cell render', cell.location)
  const [value, setValue] = useState(cell.value)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value)
  }

  const persistChange = () => {
    cell.value = value
  }

  return (
    <td key={cell.col} className="workbook-cell-outer">
      <input
        className="workbook-cell-inner"
        onChange={handleChange}
        onBlur={persistChange}
        type="text"
        value={value}
      />
    </td>
  )
}
