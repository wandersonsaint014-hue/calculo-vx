import { describe, expect, it } from 'vitest'
import { calculate, derivative, integrate, sampleGraph, solveQuadratic } from './engine'

const number = (value: string) => Number(value)

describe('calculate', () => {
  it('adds with BigNumber decimal arithmetic', () => {
    expect(calculate('0.1 + 0.2').value).toBe('0.3')
  })

  it('accepts one Portuguese decimal comma', () => {
    expect(calculate('1,5 + 2').value).toBe('3.5')
  })

  it('evaluates constants and supported functions', () => {
    expect(number(calculate('sin(pi / 2) + sqrt(9) + abs(-2)').value)).toBeCloseTo(6, 20)
  })

  it('supports exp and log', () => {
    expect(number(calculate('log(exp(2))').value)).toBeCloseTo(2, 20)
  })

  it('reports calculation steps', () => {
    expect(calculate('2 + 2').steps).toHaveLength(2)
  })

  it('rejects variables in ordinary calculations', () => {
    expect(() => calculate('x + 1')).toThrow('Símbolo não permitido')
  })

  it('rejects assignments', () => {
    expect(() => calculate('x = 1')).toThrow('Sintaxe não permitida')
  })

  it('rejects accessors / property traversal', () => {
    expect(() => calculate('pi.toString')).toThrow('Sintaxe não permitida')
  })

  it('rejects arbitrary functions', () => {
    expect(() => calculate('import("fs")')).toThrow('Função não permitida')
  })

  it('rejects multiple function arguments', () => {
    expect(() => calculate('max(1, 2)')).toThrow()
  })

  it('rejects comma as a function argument separator', () => {
    expect(() => calculate('sin(1,5)')).toThrow('vírgulas de argumentos')
  })

  it('rejects non-real domains', () => {
    expect(() => calculate('sqrt(-1)')).toThrow('número real finito')
  })

  it('rejects division by zero', () => {
    expect(() => calculate('1 / 0')).toThrow('número real finito')
  })

  it('caps non-constant and excessive exponents', () => {
    expect(() => calculate('2 ^ 1001')).toThrow('expoente')
    expect(() => derivative('x ^ x')).toThrow('expoente')
  })
})

describe('derivative', () => {
  it('derives a polynomial', () => {
    expect(derivative('x^3 + 2*x', 1).value.replace(/\s/g, '')).toBe('3*x^2+2')
  })

  it('derives supported trigonometric expressions', () => {
    expect(derivative('sin(x)', 1).value.replace(/\s/g, '')).toBe('cos(x)')
  })

  it('supports higher-order derivatives', () => {
    expect(derivative('x^4', 2).value.replace(/\s/g, '')).toBe('12*x^2')
  })

  it('enforces derivative order bounds', () => {
    expect(() => derivative('x', 0)).toThrow('1 a 5')
    expect(() => derivative('x', 6)).toThrow('1 a 5')
    expect(() => derivative('x', 1.5)).toThrow('1 a 5')
  })
})

describe('solveQuadratic', () => {
  it('solves two distinct real roots', () => {
    expect(solveQuadratic('1', '-3', '2').value).toBe('x₁ = 2, x₂ = 1')
  })

  it('solves a double root', () => {
    expect(solveQuadratic('1', '-2', '1').value).toBe('x = 1')
  })

  it('states that a negative discriminant has no real roots', () => {
    expect(solveQuadratic('1', '0', '1').value).toBe('sem raízes reais')
  })

  it('handles a linear equation', () => {
    expect(solveQuadratic('0', '2', '-4').value).toBe('x = 2')
  })

  it('handles degenerate equations explicitly', () => {
    expect(solveQuadratic('0', '0', '0').value).toBe('infinitas soluções')
    expect(solveQuadratic('0', '0', '3').value).toBe('sem solução')
  })
})

describe('integrate', () => {
  it('uses Simpson integration for x²', () => {
    expect(number(integrate('x^2', '0', '1').value)).toBeCloseTo(1 / 3, 12)
  })

  it('integrates a sine over its known interval', () => {
    expect(number(integrate('sin(x)', '0', 'pi').value)).toBeCloseTo(2, 10)
  })

  it('labels the result as approximate', () => {
    expect(integrate('x', '0', '1').steps.join(' ')).toMatch(/aproximado/i)
  })

  it('rejects sampled singularities', () => {
    expect(() => integrate('1/x', '-1', '1')).toThrow('não é finita')
  })
})

describe('sampleGraph', () => {
  it('returns the fixed sampling series', () => {
    const points = sampleGraph('x^2', -1, 1)
    expect(points).toHaveLength(401)
    expect(points[0]).toEqual({ x: -1, y: 1 })
    expect(points[points.length - 1]).toEqual({ x: 1, y: 1 })
  })

  it('splits an exact singularity into a null point', () => {
    const center = sampleGraph('1/x', -1, 1)[200]
    expect(center).toEqual({ x: 0, y: null })
  })

  it('rejects an invalid graph range', () => {
    expect(() => sampleGraph('x', 1, 1)).toThrow('intervalo')
  })

  it('rejects unsafe graph syntax', () => {
    expect(() => sampleGraph('random()', -1, 1)).toThrow('Função não permitida')
  })
})
