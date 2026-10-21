import { describe, expect, it } from 'vitest'
import { calculate, integrate, riemann, sampleGraph } from './engine'

describe('Amostragem e otimização', () => {
  it('recusa limites distintos que se confundem como Number', () => {
    for (const fn of [integrate, riemann]) {
      expect(() => fn('x', '9007199254740992', '9007199254740993')).toThrow('ponto flutuante')
    }
  })
  it('recusa malhas sem resolução na escala escolhida', () => {
    expect(() => integrate('x', '10000000000000000', '10000000000000002')).toThrow('escala')
    expect(() => riemann('x', '0', '1e-324', 200)).toThrow('ponto flutuante')
  })
  it('mantém integrais nulas em intervalos realmente nulos', () => {
    expect(integrate('x', '1', '1').value).toBe('0')
  })
  it('aceita vírgula e constantes nos extremos do gráfico', () => {
    const points = sampleGraph('x', '-1,5', 'pi')
    expect(points[0].x).toBe(-1.5)
    expect(points.at(-1)!.x).toBeCloseTo(Math.PI, 12)
  })
  it('recusa limites de gráfico inválidos e amplitudes infinitas', () => {
    expect(() => sampleGraph('x', NaN, 1)).toThrow()
    expect(() => sampleGraph('x', -1e308, 1e308)).toThrow('amplitude')
  })
  it('quebra a curva de tan entre amostras próximas a pi/2', () => {
    const points = sampleGraph('tan(x)', 1.5, 1.7)
    expect(points.some(point => point.y === null)).toBe(true)
  })
  it('não rompe um gráfico linear comum', () => {
    expect(sampleGraph('x', -10, 10).every(point => point.y !== null)).toBe(true)
  })
  it('não mistura expressões compiladas de operações diferentes', () => {
    expect(Number(integrate('x', '0', '1').value)).toBeCloseTo(0.5, 12)
    expect(Number(integrate('x^2', '0', '1').value)).toBeCloseTo(1/3, 12)
    expect(calculate('0.1+0.2').value).toBe('0.3')
  })
})
