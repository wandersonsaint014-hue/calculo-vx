import { describe, expect, it } from 'vitest'
import { all, create } from 'mathjs'
import { solveQuadratic } from './engine'

// Precisão maior somente no oráculo dos testes, independente da configuração do motor.
const reference = create(all, { number: 'BigNumber', precision: 80 })
function roots(a: string, b: string, c: string): any[] {
  const result = solveQuadratic(a, b, c)
  const match = /^x₁ = (.*), x₂ = (.*)$/.exec(result.value)
  expect(match, result.value).not.toBeNull()
  return [reference.bignumber(match![1]), reference.bignumber(match![2])]
}
function relativeError(actual: any, expected: any): number {
  return Number(reference.divide(reference.abs(reference.subtract(actual, expected)), reference.abs(expected)))
}

describe('quadratic numerical stability', () => {
  it.each(['1e20', '-1e20', '1e100', '-1e100'])(
    'preserves the small root for b=%s and checks residuals and Vieta product', b => {
      const [x1, x2] = roots('1', b, '1')
      const B = reference.bignumber(b)
      const small = reference.abs(x1).lt(reference.abs(x2)) ? x1 : x2
      const expectedSmall = reference.divide(-1, B)
      expect(relativeError(small, expectedSmall)).toBeLessThan(1e-25)
      expect(relativeError(reference.multiply(x1, x2), reference.bignumber(1))).toBeLessThan(1e-25)
      for (const x of [x1, x2]) {
        const square = reference.multiply(x, x)
        const linear = reference.multiply(B, x)
        const residual = reference.abs(reference.add(reference.add(square, linear), 1))
        const scale = reference.add(reference.add(reference.abs(square), reference.abs(linear)), 1)
        expect(Number(reference.divide(residual, scale))).toBeLessThan(1e-25)
      }
    },
  )

  it.each([
    ['1', '3', '2', 'x₁ = -1, x₂ = -2'],
    ['1', '-3', '2', 'x₁ = 2, x₂ = 1'],
    ['-1', '3', '-2', 'x₁ = 1, x₂ = 2'],
    ['1', '0', '-4', 'x₁ = 2, x₂ = -2'],
    ['1', '3', '0', 'x₁ = 0, x₂ = -3'],
    ['1', '-3', '0', 'x₁ = 3, x₂ = 0'],
  ])('preserves signs, zero roots and order for (%s,%s,%s)', (a, b, c, expected) => {
    expect(solveQuadratic(a, b, c).value).toBe(expected)
  })

  it('handles a zero double root without dividing by q=0', () => {
    expect(solveQuadratic('1', '0', '0').value).toBe('x = 0')
  })
  it('handles a nonzero double root before the stable formula', () => {
    expect(solveQuadratic('1', '2', '1').value).toBe('x = -1')
  })
})
