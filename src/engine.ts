import { all, create } from 'mathjs'

/**
 * Small, deliberately restricted expression engine.  The parser is used only
 * to build a mathjs AST; JavaScript is never evaluated.
 */
const math = create(all, {
  number: 'BigNumber',
  precision: 28,
  predictable: true,
})

type Result = { value: string; steps: string[] }
type GraphPoint = { x: number; y: number | null }

const MAX_INPUT_LENGTH = 500
const MAX_AST_NODES = 120
const MAX_AST_DEPTH = 32
const MAX_POWER_DEPTH = 4
const MAX_ABS_EXPONENT = 1000
const MAX_GRAPH_SAMPLES = 401
const FUNCTIONS = new Set(['sin', 'cos', 'tan', 'sqrt', 'abs', 'exp', 'log'])
const CONSTANTS = new Set(['pi', 'e'])

function fail(message: string): never {
  throw new Error(message)
}

/** Supports a single Portuguese decimal comma, but never function separators. */
function normalizeExpression(source: string): string {
  if (typeof source !== 'string') fail('A expressão deve ser um texto.')
  const expression = source.trim()
  if (!expression) fail('Informe uma expressão.')
  if (expression.length > MAX_INPUT_LENGTH) fail('Expressão longa demais.')

  const commas = expression.match(/,/g)?.length ?? 0
  if (commas > 0) {
    // `1,5` is a decimal; commas elsewhere are intentionally not supported.
    if (commas !== 1 || !/^.*\d,\d.*$/.test(expression) || /[A-Za-z_]\s*\([^)]*,/.test(expression)) {
      fail('Use ponto decimal em funções; vírgulas de argumentos não são permitidas.')
    }
    return expression.replace(/(\d),(\d)/, '$1.$2').replace(/\bln\s*\(/g, 'log(')
  }
  // mathjs names the natural logarithm `log`; accept the familiar `ln` alias.
  return expression.replace(/\bln\s*\(/g, 'log(')
}

function parse(source: string): any {
  const normalized = normalizeExpression(source)
  try {
    return math.parse(normalized)
  } catch {
    fail('Expressão inválida.')
  }
}

function numericConstant(node: any): number | null {
  if (node?.type === 'OperatorNode' && ['+', '-'].includes(node.op) && node.args.length === 1) {
    const value = numericConstant(node.args[0]); return value === null ? null : node.op === '-' ? -value : value
  }
  if (node?.type !== 'ConstantNode') return null
  const value = Number(node.value)
  return Number.isFinite(value) ? value : null
}

function validateAst(node: any, allowX: boolean, depth = 0, powerDepth = 0, state = { nodes: 0 }): void {
  if (!node || typeof node !== 'object') fail('Expressão inválida.')
  state.nodes += 1
  if (state.nodes > MAX_AST_NODES) fail('Expressão complexa demais.')
  if (depth > MAX_AST_DEPTH) fail('Expressão profunda demais.')

  switch (node.type) {
    case 'ParenthesisNode':
      validateAst(node.content, allowX, depth + 1, powerDepth, state)
      return
    case 'ConstantNode': {
      const value = numericConstant(node)
      if (value === null) fail('Somente números reais finitos são aceitos.')
      return
    }
    case 'SymbolNode':
      if (CONSTANTS.has(node.name) || (allowX && node.name === 'x')) return
      fail(`Símbolo não permitido: ${node.name}`)
    case 'OperatorNode': {
      if (!['+', '-', '*', '/', '^'].includes(node.op) || ![1, 2].includes(node.args.length)) {
        fail('Operador não permitido.')
      }
      const nextPowerDepth = node.op === '^' ? powerDepth + 1 : powerDepth
      if (nextPowerDepth > MAX_POWER_DEPTH) fail('Potência aninhada demais.')
      if (node.op === '^') {
        const exponent = numericConstant(node.args[1])
        if (exponent === null || Math.abs(exponent) > MAX_ABS_EXPONENT) {
          fail('O expoente deve ser um número entre -1000 e 1000.')
        }
      }
      node.args.forEach((arg: any) => validateAst(arg, allowX, depth + 1, nextPowerDepth, state))
      return
    }
    case 'FunctionNode': {
      if (node.fn?.type !== 'SymbolNode' || !FUNCTIONS.has(node.fn.name) || node.args.length !== 1) {
        fail('Função não permitida.')
      }
      validateAst(node.args[0], allowX, depth + 1, powerDepth, state)
      return
    }
    default:
      fail(`Sintaxe não permitida: ${node.type}`)
  }
}

function checkedAst(source: string, allowX: boolean): any {
  const node = parse(source)
  validateAst(node, allowX)
  return node
}

function realValue(value: any): any {
  if (math.typeOf(value) !== 'BigNumber' || !value.isFinite() || value.isNaN()) {
    fail('O resultado não é um número real finito.')
  }
  return value
}

function valueText(value: any): string {
  return math.format(realValue(value), { precision: 28, lowerExp: -1000, upperExp: 1000 })
}

function evaluateNode(node: any, x?: number): any {
  try {
    const scope = x === undefined ? {} : { x: math.bignumber(x) }
    return realValue(node.evaluate(scope))
  } catch (error) {
    if (error instanceof Error && error.message.includes('resultado não')) throw error
    fail('A expressão não pode ser avaliada no domínio real.')
  }
}

export function calculate(expression: string): Result {
  const node = checkedAst(expression, false)
  const result = evaluateNode(node)
  return {
    value: valueText(result),
    steps: [`Expressão validada: ${node.toString()}`, `Resultado: ${valueText(result)}`],
  }
}

export function derivative(expression: string, order = 1): Result {
  if (!Number.isInteger(order) || order < 1 || order > 5) fail('A ordem da derivada deve ser um inteiro de 1 a 5.')
  let node = checkedAst(expression, true)
  try {
    for (let i = 0; i < order; i += 1) {
      node = math.derivative(node, 'x', { simplify: true })
      validateAst(node, true)
    }
  } catch (error) {
    if (error instanceof Error && /não permitida|complexa|profunda|expoente/.test(error.message)) throw error
    fail('Não foi possível derivar esta expressão.')
  }
  const value = node.toString()
  return { value, steps: [`Expressão validada: ${checkedAst(expression, true).toString()}`, `Derivada de ordem ${order}: ${value}`] }
}

export function solveQuadratic(a: string, b: string, c: string): Result {
  const A = evaluateNode(checkedAst(a, false))
  const B = evaluateNode(checkedAst(b, false))
  const C = evaluateNode(checkedAst(c, false))
  const zero = math.bignumber(0)
  const steps = [`Coeficientes: a=${valueText(A)}, b=${valueText(B)}, c=${valueText(C)}`]

  if (A.equals(zero)) {
    if (B.equals(zero)) {
      if (C.equals(zero)) return { value: 'infinitas soluções', steps: [...steps, 'Equação degenerada: 0 = 0.'] }
      return { value: 'sem solução', steps: [...steps, 'Equação degenerada incompatível.'] }
    }
    const root = math.divide(math.unaryMinus(C), B)
    return { value: `x = ${valueText(root)}`, steps: [...steps, 'Equação linear (a = 0).'] }
  }

  const discriminant = math.subtract(math.multiply(B, B), math.multiply(4, A, C))
  steps.push(`Discriminante: ${valueText(discriminant)}`)
  if (discriminant.isNegative()) return { value: 'sem raízes reais', steps: [...steps, 'Discriminante negativo.'] }
  const denominator = math.multiply(2, A)
  const root = math.sqrt(discriminant)
  const x1 = math.divide(math.add(math.unaryMinus(B), root), denominator)
  const x2 = math.divide(math.subtract(math.unaryMinus(B), root), denominator)
  if (discriminant.equals(zero)) return { value: `x = ${valueText(x1)}`, steps: [...steps, 'Raiz real dupla.'] }
  return { value: `x₁ = ${valueText(x1)}, x₂ = ${valueText(x2)}`, steps: [...steps, 'Duas raízes reais.'] }
}

export function integrate(expression: string, a: string, b: string): Result {
  const node = checkedAst(expression, true)
  const start = Number(valueText(evaluateNode(checkedAst(a, false))))
  const end = Number(valueText(evaluateNode(checkedAst(b, false))))
  if (!Number.isFinite(start) || !Number.isFinite(end)) fail('Os limites devem ser reais finitos.')
  const n = 1000
  const h = (end - start) / n
  let sum = 0
  for (let i = 0; i <= n; i += 1) {
    const x = start + i * h
    let y: number
    try { y = Number(valueText(evaluateNode(node, x))) } catch { fail(`A função não é finita em x = ${x}.`) }
    if (!Number.isFinite(y)) fail(`A função não é finita em x = ${x}.`)
    sum += (i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4) * y
  }
  const approximation = (h / 3) * sum
  if (!Number.isFinite(approximation)) fail('A aproximação não é finita.')
  return {
    value: math.format(math.bignumber(approximation), { precision: 28 }),
    steps: ['Integração numérica pela regra de Simpson composta (1000 subintervalos).', 'Resultado aproximado; descontinuidades entre os pontos amostrados podem não ser detectadas.'],
  }
}

export function sampleGraph(expression: string, min = -10, max = 10): GraphPoint[] {
  const node = checkedAst(expression, true)
  if (!Number.isFinite(min) || !Number.isFinite(max) || !(min < max)) fail('O intervalo do gráfico é inválido.')
  const points: GraphPoint[] = []
  const step = (max - min) / (MAX_GRAPH_SAMPLES - 1)
  for (let i = 0; i < MAX_GRAPH_SAMPLES; i += 1) {
    const x = min + i * step
    try {
      const y = Number(valueText(evaluateNode(node, x)))
      points.push({ x, y: Number.isFinite(y) ? y : null })
    } catch {
      points.push({ x, y: null })
    }
  }
  // A very steep finite transition is normally a sampled asymptote; split it.
  for (let i = 1; i < points.length; i += 1) {
    const previous = points[i - 1]
    const current = points[i]
    if (previous.y !== null && current.y !== null && Math.abs(current.y - previous.y) > 1e6) current.y = null
  }
  return points
}
