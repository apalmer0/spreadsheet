import { ICell, TWorkbook } from '../../../types'

const OPERATORS_REGEX = /(\+|-|\*|\/|\(|\))/g

const getTokens = (formula: string): string[] => {
  return formula
    .replace('=', '')
    .split(OPERATORS_REGEX)
    .reduce((acc, curr) => {
      if (curr === '') return acc
      acc.push(curr.toUpperCase())
      return acc
    }, [] as string[])
}

// for each cell, find all upstream references (when?)
// once we have all references, use topological sort to figure out which is first
// then calculate value for each one, in order

export const getUpstreamReferences = (
  cell: ICell,
  workbook: TWorkbook,
): string[] => {
  if (!cell.formula) return []

  const tokens = getTokens(cell.formula)

  return tokens.reduce((memo, token) => {
    if (token.match(OPERATORS_REGEX)) {
      return memo
    }
    if (!isNaN(Number(token))) {
      return memo
    }
    if (token in workbook) {
      memo.push(token)
    }
    return memo
  }, [] as string[])
}

export const calculateValue = (
  cell: ICell | undefined,
  workbook: TWorkbook,
): number => {
  if (!cell) return 0
  if (!cell.formula) return Number(cell.value ?? 0)
  if (cell.formula[0] !== '=') return Number(cell.value ?? 0)

  const tokens = getTokens(cell.formula)

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
