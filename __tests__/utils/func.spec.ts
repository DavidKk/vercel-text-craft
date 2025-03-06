import { combineFuncs } from '@/utils/func'

describe('Function Combination Utilities', () => {
  it('should correctly combine multiple functions', () => {
    const mock1 = jest.fn(() => 1)
    const mock2 = jest.fn(() => 2)
    const combined = combineFuncs(mock1, mock2)

    expect(combined()).toBe(2)
    expect(mock1).toHaveBeenCalled()
    expect(mock2).toHaveBeenCalled()
  })

  it('should return undefined when handling empty function array', () => {
    const combined = combineFuncs()
    expect(combined()).toBeUndefined()
  })

  it('should skip undefined values and execute valid functions', () => {
    const mock = jest.fn(() => 'result')
    const combined = combineFuncs(undefined, mock)

    expect(combined()).toBe('result')
    expect(mock).toHaveBeenCalled()
  })
})
