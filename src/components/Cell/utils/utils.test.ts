import { calculateValue, detectCycle, getCycleElements } from './'
import { ICell, TWorkbook } from '../../../types'

describe('utils', () => {
  describe('calculateValue', () => {
    it('should return 0 if cell is undefined', () => {
      const result = calculateValue(undefined, {})

      expect(result).toEqual(0)
    })

    it('should return the cell value if there is no formula', () => {
      const cell: ICell = {
        col: 'A',
        formula: '',
        location: 'A1',
        outputs: [],
        inputs: [],
        row: '1',
        valid: true,
        value: '10',
      }
      const result = calculateValue(cell, {})

      expect(result).toEqual(10)
    })

    it('should return 0 if cell has no formula and no value', () => {
      const cell: ICell = {
        col: 'A',
        formula: '',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: '1',
        valid: true,
        value: '',
      }
      const result = calculateValue(cell, {})

      expect(result).toEqual(0)
    })

    it('should return the cell value if the formula does not start with "="', () => {
      const cell: ICell = {
        col: 'A',
        formula: '10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: '1',
        valid: true,
        value: '10',
      }
      const result = calculateValue(cell, {})

      expect(result).toEqual(10)
    })

    it('should calculate the value of a simple formula', () => {
      const cell: ICell = {
        col: 'A',
        formula: '=10+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: '1',
        valid: true,
        value: '',
      }
      const result = calculateValue(cell, {})

      expect(result).toEqual(20)
    })

    it('should calculate the value of a formula with a reference', () => {
      const cell: ICell = {
        col: 'A',
        formula: '=A2+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: '1',
        valid: true,
        value: '',
      }
      const workbook: TWorkbook = {
        A2: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: '2',
          valid: true,
          value: '10',
        },
      }
      const result = calculateValue(cell, workbook)

      expect(result).toEqual(20)
    })

    it('should calculate the value of a formula with a reference to another formula', () => {
      const cell: ICell = {
        col: 'A',
        formula: '=A2+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: '1',
        valid: true,
        value: '',
      }
      const workbook: TWorkbook = {
        A2: {
          col: 'A',
          formula: '=A3+10',
          inputs: [],
          location: 'A2',
          outputs: [],
          row: '2',
          valid: true,
          value: '',
        },
        A3: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A3',
          outputs: [],
          row: '3',
          valid: true,
          value: '10',
        },
      }
      const result = calculateValue(cell, workbook)

      expect(result).toEqual(30)
    })
  })

  describe('detectCycle', () => {
    it('should return false if there are no cycles', () => {
      const A1 = {
        col: 'A',
        formula: '=A2+10',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: '1',
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
          row: '2',
          valid: true,
          value: '10',
        },
      }
      const result = detectCycle(A1, workbook)

      expect(result).toEqual(false)
    })

    it('should return false if referencing the same cell twice', () => {
      const A1 = {
        col: 'A',
        formula: '=A2+A2',
        inputs: [],
        location: 'A1',
        outputs: [],
        row: '1',
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
          row: '2',
          valid: true,
          value: '10',
        },
      }
      const result = detectCycle(A1, workbook)

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
          row: '1',
          valid: true,
          value: '10',
        },
        A2: {
          col: 'A',
          formula: '=A1',
          inputs: ['A1'],
          location: 'A2',
          outputs: ['A3'],
          row: '2',
          valid: true,
          value: '10',
        },
        A3: {
          col: 'A',
          formula: '=A1+A2',
          inputs: ['A1', 'A2'],
          location: 'A3',
          outputs: [],
          row: '3',
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
        row: '1',
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
        row: '1',
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
          row: '2',
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
        row: '1',
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
          row: '1',
          valid: true,
          value: '2',
        },
        C1: {
          col: 'C',
          formula: '=A1+10',
          inputs: [],
          location: 'C1',
          outputs: [],
          row: '1',
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
        row: '1',
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
          row: '2',
          valid: true,
          value: '10',
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
          row: '1',
          valid: true,
          value: '10',
        },
        A2: {
          col: 'A',
          formula: '=A1',
          inputs: ['A1'],
          location: 'A2',
          outputs: ['A3'],
          row: '2',
          valid: true,
          value: '10',
        },
        A3: {
          col: 'A',
          formula: '=A1+A2',
          inputs: ['A1', 'A2'],
          location: 'A3',
          outputs: [],
          row: '3',
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
        row: '1',
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
          row: '2',
          valid: true,
          value: '10',
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
        row: '1',
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
        row: '1',
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
          row: '2',
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
          row: '1',
          valid: true,
          value: '1',
        },
        B1: {
          col: 'B',
          formula: '=C1+10',
          inputs: [],
          location: 'B1',
          outputs: [],
          row: '1',
          valid: true,
          value: '2',
        },
        C1: {
          col: 'C',
          formula: '=A1+10',
          inputs: [],
          location: 'C1',
          outputs: [],
          row: '1',
          valid: true,
          value: '3',
        },
        D1: {
          col: 'D',
          formula: '=D6+10',
          inputs: [],
          location: 'D1',
          outputs: [],
          row: '1',
          valid: true,
          value: '3',
        },
      }
      const result = getCycleElements(workbook.A1, workbook)

      expect(result).toHaveLength(3)
      expect(result).toEqual(expect.arrayContaining(['A1', 'B1', 'C1']))
    })
  })
})
