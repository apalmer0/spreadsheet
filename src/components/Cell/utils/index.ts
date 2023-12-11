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

export const getInputLocations = (
  formula: string,
  workbook: TWorkbook,
): string[] => {
  if (!formula) return []

  const tokens = getTokens(formula)

  return tokens.reduce((memo, token) => {
    if (token.match(OPERATORS_REGEX)) return memo
    if (!isNaN(Number(token))) return memo
    if (memo.includes(token)) return memo

    if (token in workbook) {
      memo.push(token)
    }
    return memo
  }, [] as string[])
}

export const getCycleElements = (
  cell: ICell,
  workbook: TWorkbook,
  seen: Set<string> = new Set(),
  cycle: Set<string> = new Set(),
): string[] => {
  const inputLocations = getInputLocations(cell.formula, workbook)

  inputLocations.forEach((inputLocation) => {
    const inputCell = workbook[inputLocation]

    if (seen.has(inputLocation)) {
      cycle.add(cell.location)
      Array.from(seen).forEach((location) => {
        cycle.add(location)
      })
    } else {
      seen.add(cell.location)
      getCycleElements(inputCell, workbook, seen, cycle)
    }
  })

  return Array.from(cycle)
}

export const detectCycle = (cell: ICell, workbook: TWorkbook): boolean => {
  return getCycleElements(cell, workbook).length > 0
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
