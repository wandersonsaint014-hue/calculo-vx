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
  if (node?.type === 'ParenthesisNode') return numericConstant(node.content)
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
  const steps = [`Expressão validada: ${node.toString()}`, 'Derivação simbólica; o resumo não substitui uma demonstração e deve respeitar o domínio da função original.']
  try {
    for (let i = 0; i < order; i += 1) {
      node = math.derivative(node, 'x', { simplify: true })
      validateAst(node, true)
      steps.push(`Derivada de ordem ${i + 1}: ${node.toString()}`)
    }
  } catch (error) {
    if (error instanceof Error && /não permitida|complexa|profunda|expoente/.test(error.message)) throw error
    fail('Não foi possível derivar esta expressão.')
  }
  const value = node.toString()
  return { value, steps }
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

/** Recognizes polynomial denominators up to degree two, not general singularities. */
function polynomial(node: any): number[] | null {
  if (node.type === 'ParenthesisNode') return polynomial(node.content)
  if (node.type === 'SymbolNode' && node.name === 'x') return [0, 1, 0]
  const c = numericConstant(node)
  if (c !== null) return [c, 0, 0]
  if (node.type !== 'OperatorNode') return null
  const a = polynomial(node.args[0])
  if (!a) return null
  if (node.args.length === 1) return a.map(v => node.op === '-' ? -v : v)
  const b = polynomial(node.args[1])
  if (!b) return null
  if (node.op === '+' || node.op === '-') return a.map((v, i) => v + (node.op === '+' ? b[i] : -b[i]))
  if (node.op === '*') {
    const c = Array(5).fill(0)
    a.forEach((v, i) => b.forEach((w, j) => { c[i + j] += v * w }))
    return c[3] === 0 && c[4] === 0 ? c.slice(0, 3) : null
  }
  if (node.op === '^' && numericConstant(node.args[1]) === 2 && a[2] === 0) return [a[0] ** 2, 2*a[0]*a[1], a[1] ** 2]
  return null
}

function checkSampledInterval(node: any, start: number, end: number): void {
  const low = Math.min(start, end), high = Math.max(start, end)
  node.traverse((part: any) => {
    const denominator = part.type === 'OperatorNode' && part.op === '/' ? part.args[1]
      : part.type === 'OperatorNode' && part.op === '^' && numericConstant(part.args[1]) !== null && numericConstant(part.args[1])! < 0 ? part.args[0] : null
    if (!denominator) return
    const p = polynomial(denominator)
    if (!p || p.some(v => !Number.isFinite(v))) return
    const [c, b, a] = p
    let roots: number[] = []
    if (a === 0 && b === 0 && c === 0) fail('A função não é finita: denominador nulo no intervalo.')
    if (a === 0 && b !== 0) roots = [-c / b]
    else if (a !== 0) {
      const d = b*b - 4*a*c
      if (d >= 0) {
        const q = -0.5 * (b + (b >= 0 ? 1 : -1) * Math.sqrt(d))
        roots = q === 0 ? [0] : [q / a, c / q]
      }
    }
    if (roots.some(x => x >= low && x <= high)) fail('A função não é finita em todo o intervalo: denominador zera. Integrais impróprias não são suportadas, mesmo com cancelamento algébrico.')
  })
}

function interval(expression: string, a: string, b: string) {
  const node = checkedAst(expression, true)
  const start = Number(valueText(evaluateNode(checkedAst(a, false))))
  const end = Number(valueText(evaluateNode(checkedAst(b, false))))
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(end - start)) fail('Os limites devem ser reais finitos com amplitude finita.')
  checkSampledInterval(node, start, end)
  return { node, start, end }
}

export function integrate(expression: string, a: string, b: string): Result {
  const { node, start, end } = interval(expression, a, b)
  const simpson = (n: number) => {
    const h = (end - start) / n
    let sum = 0, correction = 0
    for (let i = 0; i <= n; i += 1) {
      const x = start + i * h
      let y: number
      try { y = Number(valueText(evaluateNode(node, x))) } catch { fail(`A função não é finita em x = ${x}.`) }
      if (!Number.isFinite(y)) fail(`A função não é finita em x = ${x}.`)
      const term = (i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4) * y - correction
      const next = sum + term
      correction = (next - sum) - term
      sum = next
    }
    return h / 3 * sum
  }
  const coarse = simpson(500), medium = simpson(1000), fine = simpson(2000)
  if (![coarse, medium, fine].every(Number.isFinite)) fail('A aproximação não é finita.')
  const difference = Math.max(Math.abs(fine - medium), Math.abs(medium - coarse))
  if (difference > 1e-7 * Math.max(1, Math.abs(fine))) fail('Integração inconclusiva: as malhas não concordam. Pode haver oscilação, descontinuidade ou necessidade de outro método.')
  return {
    value: math.format(fine, { precision: 12 }),
    steps: [
      `Integral definida de ${node.toString()} entre ${a} e ${b}.`,
      'Regra de Simpson composta: h/3 × [f(a) + 4f(x₁) + 2f(x₂) + … + f(b)].',
      `Comparação de malhas: S₅₀₀ = ${math.format(coarse, {precision: 12})}; S₁₀₀₀ = ${math.format(medium, {precision: 12})}; S₂₀₀₀ = ${math.format(fine, {precision: 12})}.`,
      `Diferença entre as duas últimas malhas: ${Math.abs(fine - medium).toExponential(3)}. Não é uma garantia de erro.`,
      'Resultado aproximado em ponto flutuante, não exato. Malhas concordantes podem ocultar oscilações e singularidades entre amostras. Integrais impróprias não são suportadas.',
    ],
  }
}

export function riemann(expression: string, a: string, b: string, n = 8, method = 'midpoint'): Result {
  if (!Number.isInteger(n) || n < 2 || n > 200) fail('Use de 2 a 200 retângulos inteiros.')
  if (!['left', 'midpoint', 'right'].includes(method)) fail('Escolha esquerda, ponto médio ou direita.')
  const { node, start, end } = interval(expression, a, b)
  const h = (end - start) / n
  const offset = method === 'left' ? 0 : method === 'right' ? 1 : 0.5
  let sum = 0
  for (let i = 0; i < n; i += 1) sum += Number(valueText(evaluateNode(node, start + (i + offset) * h))) * h
  if (!Number.isFinite(sum)) fail('A soma não é finita.')
  const name = method === 'left' ? 'esquerda' : method === 'right' ? 'direita' : 'ponto médio'
  return { value: math.format(sum, {precision: 12}), steps: [
    `Soma de Riemann aproximada: ${n} retângulos, ${name}.`,
    `Δx = (b − a)/n = ${math.format(h, {precision: 12})}; soma = Σ f(xᵢ*) × Δx.`,
    'Área com sinal, não área geométrica total. Aumentar n não garante precisão para funções descontínuas ou oscilatórias.',
  ] }
}

/** A teaching aid, deliberately not a general symbolic limit solver. */
export function exploreLimit(expression: string, target: string): Result {
  const node = checkedAst(expression, true)
  const center = Number(valueText(evaluateNode(checkedAst(target, false))))
  if (!Number.isFinite(center) || Math.abs(center) > 1e10) fail('Use um ponto finito entre -10¹⁰ e 10¹⁰.')
  // Compare full AST strings, not textual fragments; parentheses are significant.
  const same = (source: string) => node.equals(checkedAst(source, true))
  let value = 'Inconclusivo: amostras numéricas não provam a existência nem o valor do limite.'
  let rule = 'Fora dos exemplos demonstrados em zero, esta ferramenta apenas explora amostras. Não é um resolvedor geral de limites.'
  if (center === 0) {
    if (same('1/x^2')) { value = '+∞ (divergência; não há limite real finito)'; rule = 'Para x ≠ 0, 1/x² > 0 e cresce sem limite pelos dois lados: dado M > 0, 0 < |x| < 1/√M implica 1/x² > M.' }
    else if (same('1/x')) { value = 'Não existe limite bilateral: esquerda −∞; direita +∞.'; rule = 'O sinal de 1/x acompanha o sinal de x. Os comportamentos laterais são diferentes.' }
    else if (same('sin(1/x)')) { value = 'Não existe, nem pela esquerda nem pela direita: oscilação.'; rule = 'As sequências xₙ = 1/(π/2 + 2πn) e yₙ = 1/(3π/2 + 2πn) tendem a zero pela direita, mas produzem 1 e −1. Pelo lado esquerdo a oscilação também persiste.' }
    else if (same('sin(x)/x')) { value = '1 (limite notável em radianos)'; rule = 'Pela desigualdade cos(x) ≤ sin(x)/x ≤ 1 para 0 < |x| < π/2 e pelo teorema do confronto, o limite é 1.' }
    else if (same('abs(x)/x')) { value = 'Não existe limite bilateral: esquerda −1; direita 1.'; rule = 'Para x < 0, |x|/x = −1; para x > 0, |x|/x = 1.' }
  }
  const steps = [rule, 'Tabela exploratória: valores de f(a − h) e f(a + h), não limites laterais.']
  for (const h of [0.1, 0.01, 0.001, 0.0001]) {
    const sample = (x: number) => { try { return math.format(Number(valueText(evaluateNode(node, x))), {precision: 8}) } catch { return 'fora do domínio real' } }
    steps.push(`h = ${h}: esquerda ${sample(center - h)}; direita ${sample(center + h)}.`)
  }
  steps.push('Poucas amostras podem enganar. Uma divergência infinita nunca deve ser apresentada como um grande número finito.')
  return { value, steps }
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
