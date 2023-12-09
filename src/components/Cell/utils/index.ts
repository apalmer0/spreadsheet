import { ICell, TWorkbook } from '../../../types'

const OPERATORS_REGEX = /(\+|-|\*|\/|\(|\))/g

export const calculateValue = (
  cell: ICell | undefined,
  workbook: TWorkbook,
): number => {
  if (!cell) return 0
  if (!cell.formula) return Number(cell.value ?? 0)
  if (cell.formula[0] !== '=') return Number(cell.value ?? 0)

  const tokens = cell.formula
    .replace('=', '')
    .split(OPERATORS_REGEX)
    .reduce((acc, curr) => {
      if (curr === '') return acc
      acc.push(curr.toUpperCase())
      return acc
    }, [] as string[])

  let result = 0
  let operation = undefined

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (!token.match(OPERATORS_REGEX)) {
      let cellValue = 0
      if (isNaN(Number(token))) {
        const cell = workbook[token]
        cellValue = calculateValue(cell, workbook)
      } else {
        cellValue = Number(token)
      }

      if (!operation) {
        result += cellValue
      } else if (operation === '+') {
        result += cellValue
      } else if (operation === '-') {
        result -= cellValue
      } else if (operation === '*') {
        result *= cellValue
      } else if (operation === '/') {
        result /= cellValue
      } else {
        throw new Error('Unknown operation')
      }
    } else {
      operation = token
    }
  }

  return result
}
