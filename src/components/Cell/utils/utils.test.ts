import {
  calculateValue,
  detectCycle,
  getCycleElements,
  getInputLocations,
  formulaIsValid,
  getTokens,
  tokenIsCellLocation,
  valueIsString,
} from './'
import { ICell, TWorkbook } from '../../../types'

describe('utils', () => {
  describe('calculateValue', () => {
    it('should return the cell value if the value is a string', () => {
      const cell: ICell = {
        col: 'A',
        formula: '',
        location: 'A1',
        outputs: [],
        inputs: [],
        row: 1,
        valid: true,
        value: 'foobar',
      }
      const result = calculateValue(cell, {})

      expect(result).toEqual('foobar')
    })

    it('should return the cell value if there is no formula', () => {
      const cell: ICell = {
        col: 'A',
        formula: '10',
        location: 'A1',
        outputs: [],
        inputs: [],
        row: 1,
        valid: true,
        value: 'foobar',
      }
      const result = calculateValue(cell, {})

      expect(result).toEqual('foobar')
    })

    it('should return an empty string if cell has no formula and no value', () => {
      const cell: ICell = {
        col: 'A',
        formula: '',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: '',
      }
      const result = calculateValue(cell, {})

      expect(result).toEqual('')
    })

    it('should return the cell value if the formula does not start with "="', () => {
      const cell: ICell = {
        col: 'A',
        formula: 'foobar',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: 'foobar',
      }
      const result = calculateValue(cell, {})

      expect(result).toEqual('foobar')
    })

    it('should calculate the value of a simple formula', () => {
      const cell: ICell = {
        col: 'A',
        formula: '=10+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: '',
      }
      const result = calculateValue(cell, {})

      expect(result).toEqual(20)
    })

    it('should calculate the value of a formula with a reference', () => {
      const workbook: TWorkbook = {
        A1: {
          col: 'A',
          formula: '=A2+10',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: '',
        },
        A2: {
          col: 'A',
          formula: '5',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: 5,
        },
      }
      const result = calculateValue(workbook.A1, workbook)

      expect(result).toEqual(15)
    })

    it('should calculate the value of a formula with a reference to another formula', () => {
      const workbook: TWorkbook = {
        A1: {
          col: 'A',
          formula: '=A2+10',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: '',
        },
        A2: {
          col: 'A',
          formula: '=A3+10',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: 20,
        },
        A3: {
          col: 'A',
          formula: '10',
          inputs: [],
          location: 'A3',
          outputs: [],
          row: 3,
          valid: true,
          value: 10,
        },
      }
      const result = calculateValue(workbook.A1, workbook)

      expect(result).toEqual(30)
    })

    it("should return the value from a referenced cell if that cell's value is a string", () => {
      const workbook: TWorkbook = {
        A1: {
          col: 'A',
          formula: '=A2',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: '',
        },
        A2: {
          col: 'A',
          formula: 'foobar',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: 'foobar',
        },
      }
      const result = calculateValue(workbook.A1, workbook)

      expect(result).toEqual('foobar')
    })

    it('should return concatenate if a formula tries to do math on a referenced cell whoses value is a string', () => {
      const workbook: TWorkbook = {
        A1: {
          col: 'A',
          formula: '=A2+10',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: '',
        },
        A2: {
          col: 'A',
          formula: 'foobar',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: 'foobar',
        },
      }
      const result = calculateValue(workbook.A1, workbook)

      expect(result).toEqual('foobar10')
    })

    it('should concatenate the values of two string cells', () => {
      const workbook: TWorkbook = {
        A1: {
          col: 'A',
          formula: 'abc',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: 'abc',
        },
        A2: {
          col: 'A',
          formula: 'def',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: 'def',
        },
        A3: {
          col: 'A',
          formula: '=A1+A2',
          inputs: [],
          location: 'A3',
          outputs: [],
          row: 3,
          valid: true,
          value: '',
        },
      }
      const result = calculateValue(workbook.A3, workbook)

      expect(result).toEqual('abcdef')
    })
  })

  describe('detectCycle', () => {
    it('should return false if there are no cycles', () => {
      const workbook: TWorkbook = {
        A1: {
          col: 'A',
          formula: '=A2+10',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: '',
        },
        A2: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: 'foobar',
        },
      }
      const result = detectCycle(workbook.A1, workbook)

      expect(result).toEqual(false)
    })

    it('should return false if referencing the same cell twice', () => {
      const workbook: TWorkbook = {
        A1: {
          col: 'A',
          formula: '=A2+A2',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: '',
        },
        A2: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: 'foobar',
        },
      }
      const result = detectCycle(workbook.A1, workbook)

      expect(result).toEqual(false)
    })

    it('should return false if no cycle exists', () => {
      const workbook = {
        A1: {
          col: 'A',
          formula: '10',
          inputs: [],
          location: 'A1',
          outputs: ['A2', 'A3'],
          row: 1,
          valid: true,
          value: 'foobar',
        },
        A2: {
          col: 'A',
          formula: '=A1',
          inputs: ['A1'],
          location: 'A2',
          outputs: ['A3'],
          row: 2,
          valid: true,
          value: 'foobar',
        },
        A3: {
          col: 'A',
          formula: '=A1+A2',
          inputs: ['A1', 'A2'],
          location: 'A3',
          outputs: [],
          row: 3,
          valid: true,
          value: '20',
        },
      }

      const result = detectCycle(workbook.A3, workbook)

      expect(result).toEqual(false)
    })

    it('should return true if there is a simple cycle', () => {
      const A1 = {
        col: 'A',
        formula: '=A1+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: '1',
      }
      const workbook: TWorkbook = {
        A1,
      }
      const result = detectCycle(A1, workbook)

      expect(result).toEqual(true)
    })

    it('should return true if there is a cycle', () => {
      const A1: ICell = {
        col: 'A',
        formula: '=A2+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: '1',
      }
      const workbook: TWorkbook = {
        A1,
        A2: {
          col: 'A',
          formula: '=A1+10',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: '2',
        },
      }
      const result = detectCycle(A1, workbook)

      expect(result).toEqual(true)
    })

    it('should return true if there is a bigger cycle', () => {
      const A1: ICell = {
        col: 'A',
        formula: '=B1+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: '1',
      }
      const workbook: TWorkbook = {
        A1,
        B1: {
          col: 'B',
          formula: '=C1+10',
          inputs: [],
          location: 'B1',
          outputs: [],
          row: 1,
          valid: true,
          value: '2',
        },
        C1: {
          col: 'C',
          formula: '=A1+10',
          inputs: [],
          location: 'C1',
          outputs: [],
          row: 1,
          valid: true,
          value: '3',
        },
      }
      const result = detectCycle(A1, workbook)

      expect(result).toEqual(true)
    })
  })

  describe('getCycleElements', () => {
    it('should an empty array if there are no cycles', () => {
      const A1 = {
        col: 'A',
        formula: '=A2+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: '',
      }
      const workbook: TWorkbook = {
        A1,
        A2: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: 'foobar',
        },
      }
      const result = getCycleElements(A1, workbook)

      expect(result).toEqual([])
    })

    it('should return an empty array no cycle exists', () => {
      const workbook = {
        A1: {
          col: 'A',
          formula: '10',
          inputs: [],
          location: 'A1',
          outputs: ['A2', 'A3'],
          row: 1,
          valid: true,
          value: 'foobar',
        },
        A2: {
          col: 'A',
          formula: '=A1',
          inputs: ['A1'],
          location: 'A2',
          outputs: ['A3'],
          row: 2,
          valid: true,
          value: 'foobar',
        },
        A3: {
          col: 'A',
          formula: '=A1+A2',
          inputs: ['A1', 'A2'],
          location: 'A3',
          outputs: [],
          row: 3,
          valid: true,
          value: '20',
        },
      }

      const result = getCycleElements(workbook.A3, workbook)

      expect(result).toEqual([])
    })

    it('should an empty array if referencing the same cell twice', () => {
      const A1 = {
        col: 'A',
        formula: '=A2+A2',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: '',
      }
      const workbook: TWorkbook = {
        A1,
        A2: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: 'foobar',
        },
      }
      const result = getCycleElements(A1, workbook)

      expect(result).toEqual([])
    })

    it('should return the elements in the cycle if there is a simple cycle', () => {
      const A1 = {
        col: 'A',
        formula: '=A1+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: '1',
      }
      const workbook: TWorkbook = {
        A1,
      }
      const result = getCycleElements(A1, workbook)

      expect(result).toEqual(['A1'])
    })

    it('should return the elements in the cycle if there is a cycle', () => {
      const A1: ICell = {
        col: 'A',
        formula: '=A2+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: 1,
        valid: true,
        value: '1',
      }
      const workbook: TWorkbook = {
        A1,
        A2: {
          col: 'A',
          formula: '=A1+10',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 2,
          valid: true,
          value: '2',
        },
      }
      const result = getCycleElements(A1, workbook)

      expect(result).toHaveLength(2)
      expect(result).toEqual(expect.arrayContaining(['A1', 'A2']))
    })

    it('should return the elements in the cycle if there is a bigger cycle', () => {
      const workbook: TWorkbook = {
        A1: {
          col: 'A',
          formula: '=B1+10',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: '1',
        },
        B1: {
          col: 'B',
          formula: '=C1+10',
          inputs: [],
          location: 'B1',
          outputs: [],
          row: 1,
          valid: true,
          value: '2',
        },
        C1: {
          col: 'C',
          formula: '=A1+10',
          inputs: [],
          location: 'C1',
          outputs: [],
          row: 1,
          valid: true,
          value: '3',
        },
        D1: {
          col: 'D',
          formula: '=D6+10',
          inputs: [],
          location: 'D1',
          outputs: [],
          row: 1,
          valid: true,
          value: '3',
        },
      }
      const result = getCycleElements(workbook.A1, workbook)

      expect(result).toHaveLength(3)
      expect(result).toEqual(expect.arrayContaining(['A1', 'B1', 'C1']))
    })
  })

  describe('tokenIsCellLocation', () => {
    it('should return true if the token is a cell location', () => {
      const result = tokenIsCellLocation('A1')

      expect(result).toEqual(true)
    })

    it('should return false if the token is not a cell location (string)', () => {
      const result = tokenIsCellLocation('A')

      expect(result).toEqual(false)
    })

    it('should return false if the token is not a cell location (digit)', () => {
      const result = tokenIsCellLocation('1')

      expect(result).toEqual(false)
    })

    it('should return false if the token is not a cell location (combo)', () => {
      const result = tokenIsCellLocation('A3A1')

      expect(result).toEqual(false)
    })
  })

  describe('formulaIsValid', () => {
    it('should return true if the formula is valid', () => {
      const result = formulaIsValid('=A1+A2')

      expect(result).toEqual(true)
    })

    it('should return true if the formula is valid, starting with number', () => {
      const result = formulaIsValid('=10+A2')

      expect(result).toEqual(true)
    })

    it('should return false if the formula is just "=', () => {
      const result = formulaIsValid('=')

      expect(result).toEqual(false)
    })

    it('should return false if the formula is not valid', () => {
      const result = formulaIsValid('A1+A2')

      expect(result).toEqual(false)
    })

    it('should return false if the formula starts with two "="', () => {
      const result = formulaIsValid('==A1+A2')

      expect(result).toEqual(false)
    })
  })

  describe('getTokens', () => {
    it('should return an empty array if there are no tokens', () => {
      const result = getTokens('')

      expect(result).toEqual([])
    })

    it('should return the tokens of a string formula', () => {
      const result = getTokens('=A1+A2')

      expect(result).toEqual(['A1', '+', 'A2'])
    })
  })

  describe('getInputLocations', () => {
    it('should return cell references from a formula', () => {
      const workbook = {
        A1: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: 'foobar',
        },
        A2: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: 1,
          valid: true,
          value: 'foobar',
        },
      }
      const result = getInputLocations('=A1+A2', workbook)

      expect(result).toEqual(['A1', 'A2'])
    })

    it('should ignore values from a formula', () => {
      const workbook = {
        A1: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: 'foobar',
        },
      }
      const result = getInputLocations('=A1+10', workbook)

      expect(result).toEqual(['A1'])
    })

    it('should ignore non-existent cells from a formula', () => {
      const workbook = {
        A1: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A1',
          outputs: [],
          row: 1,
          valid: true,
          value: 'foobar',
        },
      }
      const result = getInputLocations('=X23+10', workbook)

      expect(result).toEqual([])
    })
  })

  describe('valueIsString', () => {
    it('should return true if the value is a string', () => {
      const result = valueIsString('foobar')

      expect(result).toEqual(true)
    })

    it('should return true if the value is an empty string', () => {
      const result = valueIsString('')

      expect(result).toEqual(true)
    })

    it('should return false if the value is a number', () => {
      const result = valueIsString(10)

      expect(result).toEqual(false)
    })

    it('should return false if the value is a stringified number', () => {
      const result = valueIsString('10')

      expect(result).toEqual(false)
    })
  })
})
