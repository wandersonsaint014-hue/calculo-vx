/// <reference lib="webworker" />
import { calculate, derivative, solveQuadratic, integrate, sampleGraph, riemann, exploreLimit } from './engine'
const operations = { calculate, derivative, solveQuadratic, integrate, sampleGraph, riemann, exploreLimit }
self.onmessage = (event: MessageEvent) => {
  const { id, operation, args } = event.data ?? {}
  try {
    if (!Object.prototype.hasOwnProperty.call(operations, operation) || !Array.isArray(args)) throw new Error('Operação inválida.')
    const fn = operations[operation as keyof typeof operations] as (...args: any[]) => unknown
    self.postMessage({ id, result: fn(...args) })
  } catch (error) { self.postMessage({ id, error: error instanceof Error ? error.message : 'Não foi possível calcular.' }) }
}
