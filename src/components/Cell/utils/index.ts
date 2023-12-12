import { ICell, TWorkbook } from '../../../types'

const OPERATORS_REGEX = /(\+|-|\*|\/|\(|\))/g

export const getTokens = (formula: string): string[] => {
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

export const tokenIsCellLocation = (token: string): boolean => {
  const regex = /^[a-zA-Z]\d$/
  return regex.test(token)
}

export const formulaIsValid = (formula: string): boolean => {
  const regex = /^=[a-zA-Z0-9]+/
  return regex.test(formula)
}

export const valueIsString = (value: string | number): value is string => {
  return value === '' || isNaN(Number(value))
}

export const calculateValue = (
  cell: ICell,
  workbook: TWorkbook,
): number | string => {
  if (!formulaIsValid(cell.formula)) return cell.value

  const tokens = getTokens(cell.formula)

  let result: string | number = 0
  let operation = undefined

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]

    if (token.match(OPERATORS_REGEX)) {
      operation = token
    } else {
      let cellValue: string | number = ''
      if (tokenIsCellLocation(token)) {
        const cell = workbook[token]
        cellValue = calculateValue(cell, workbook)
      } else {
        cellValue = token
      }

      if (valueIsString(cellValue)) {
        if (result === 0) {
          result = ''
        }
        if (!operation || operation === '+') {
          result += cellValue
        } else {
          throw new Error('Unsupported operation')
        }
      } else {
        cellValue = Number(cellValue)

        if (valueIsString(result)) {
          if (!operation || operation === '+') {
            result += cellValue
          } else {
            throw new Error('Unsupported operation')
          }
        } else {
          result = Number(result)

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
        }
      }
    }
  }

  return result
}
