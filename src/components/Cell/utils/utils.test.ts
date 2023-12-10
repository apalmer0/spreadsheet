import { calculateValue } from './'
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
          value: '',
        },
        A3: {
          col: 'A',
          formula: '',
          inputs: [],
          location: 'A3',
          outputs: [],
          row: '3',
          value: '10',
        },
      }
      const result = calculateValue(cell, workbook)

      expect(result).toEqual(30)
    })
  })
})
