import ResultCard from './ResultCard'
import StudyPanel from './StudyPanel'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'

type Operation = 'calculate' | 'derivative' | 'solveQuadratic' | 'integrate' | 'sampleGraph' | 'riemann' | 'exploreLimit'
type Result = { value: string; steps: string[] }
type Point = { x: number; y: number | null }
type Tab = 'basic' | 'derivative' | 'quadratic' | 'integral' | 'graph' | 'limit' | 'riemann'
type HistoryItem = { id: number; label: string; value: string }

const tabs: { id: Tab; label: string; hint: string }[] = [
  { id: 'basic', label: 'Calcular', hint: 'Avalie uma expressão numérica' },
  { id: 'derivative', label: 'Derivada', hint: 'Use x como variável' },
  { id: 'quadratic', label: '2º grau', hint: 'ax² + bx + c = 0' },
  { id: 'integral', label: 'Integral', hint: 'Aproximação numérica' },
  { id: 'limit', label: 'Limites', hint: 'Exemplos demonstrados e exploração numérica' },
  { id: 'riemann', label: 'Riemann', hint: 'Explore a integral com retângulos' },
  { id: 'graph', label: 'Gráfico', hint: 'Amostragem da função' },
]

function App() {
  const [tab, setTab] = useState<Tab>('basic')
  const [basic, setBasic] = useState('2 * (3 + 4)')
  const [derivativeExpression, setDerivativeExpression] = useState('sin(x) * x^2')
  const [order, setOrder] = useState('1')
  const [quadratic, setQuadratic] = useState({ a: '1', b: '-3', c: '2' })
  const [integral, setIntegral] = useState({ expression: 'sin(x)', a: '0', b: 'pi' })
  const [graph, setGraph] = useState({ expression: 'sin(x)', min: '-10', max: '10' })
  const [limit, setLimit] = useState({expression:'sin(x)/x',target:'0'})
  const [riemann, setRiemann] = useState({expression:'x^2',a:'0',b:'1',n:'8',method:'midpoint'})
  const [result, setResult] = useState<Result | null>(null)
  const [points, setPoints] = useState<Point[] | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [installEvent, setInstallEvent] = useState<any>(null)
  const [notice, setNotice] = useState('')
  const worker = useRef<Worker | null>(null)
  const requestId = useRef(0)

  const makeWorker = () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  const resetWorker = () => { worker.current?.terminate(); worker.current = makeWorker() }
  useEffect(() => { resetWorker(); return () => worker.current?.terminate() }, [])
  useEffect(() => {
    try { const stored = JSON.parse(localStorage.getItem('calculo-vx-history') || '[]'); if (Array.isArray(stored)) setHistory(stored.filter(item => item && typeof item.label === 'string' && typeof item.value === 'string' && typeof item.id === 'number').slice(0,20)) } catch { /* armazenamento pode estar indisponível */ }
  }, [])
  useEffect(() => {
    const install = (event: Event) => { event.preventDefault(); setInstallEvent(event) }
    const offline = () => setNotice('Pronto para usar offline.')
    const update = () => setNotice('Há uma atualização disponível. Termine o que estiver fazendo e atualize quando quiser.')
    window.addEventListener('beforeinstallprompt', install); window.addEventListener('vx-offline-ready', offline); window.addEventListener('vx-update-ready', update)
    return () => { window.removeEventListener('beforeinstallprompt', install); window.removeEventListener('vx-offline-ready', offline); window.removeEventListener('vx-update-ready', update) }
  }, [])

  const saveHistory = (label: string, value: string) => {
    const next = [{ id: Date.now(), label, value }, ...history].slice(0, 20)
    setHistory(next)
    try { localStorage.setItem('calculo-vx-history', JSON.stringify(next)) } catch { /* sem impacto no cálculo */ }
  }
  const run = (operation: Operation, args: unknown[]) => new Promise<any>((resolve, reject) => {
    if (!worker.current) resetWorker()
    const id = ++requestId.current
    const timeout = window.setTimeout(() => { resetWorker(); reject(new Error('O cálculo demorou mais de 8 segundos e foi interrompido para proteger a interface.')) }, 8000)
    worker.current!.onmessage = ({ data }) => {
      if (data?.id !== id) return
      window.clearTimeout(timeout)
      if (data.error) reject(new Error(data.error)); else resolve(data.result)
    }
    worker.current!.onerror = () => { window.clearTimeout(timeout); resetWorker(); reject(new Error('O motor de cálculo encontrou um erro. Tente novamente.')) }
    worker.current!.postMessage({ id, operation, args })
  })
  const execute = async (event: FormEvent, operation: Operation, args: unknown[], label: string) => {
    event.preventDefault(); setBusy(true); setError(''); setResult(null); setPoints(null)
    try {
      const response = await run(operation, args)
      if (operation === 'sampleGraph') { setPoints(response); setResult({ value: 'Gráfico amostrado com 401 pontos.', steps: ['O traçado é uma aproximação visual; pontos inválidos interrompem a linha.'] }); saveHistory(label, 'Gráfico gerado') }
      else { setResult(response); saveHistory(label, response.value) }
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível concluir o cálculo.') }
    finally { setBusy(false) }
  }
  const clearHistory = () => { setHistory([]); try { localStorage.removeItem('calculo-vx-history') } catch { /* nada a fazer */ } }
  const install = async () => { if (!installEvent) return; installEvent.prompt(); await installEvent.userChoice; setInstallEvent(null) }
  const current = tabs.find(item => item.id === tab)!

  return <main className="shell">
    <header className="hero"><div><p className="eyebrow">CALCULE • ENTENDA • EXPLORE</p><h1>Cálculo <span>VX</span></h1><p>Ferramentas diretas para calcular, estudar e visualizar funções.</p></div><div className="header-actions">{installEvent && <button className="install" onClick={install}>Instalar app</button>}<a href="https://github.com/wandersonsaint014-hue/calculo-vx/issues" target="_blank" rel="noreferrer">Reportar problema</a></div></header>
    {notice && <div className="notice" role="status">{notice} {notice.includes('atualização') && <button onClick={() => window.dispatchEvent(new Event('vx-apply-update'))}>Atualizar agora</button>}</div>}
    <nav aria-label="Ferramentas">{tabs.map(item => <button key={item.id} className={tab === item.id ? 'active' : ''} disabled={busy} onClick={() => { setTab(item.id); setError(''); setResult(null); setPoints(null) }} aria-current={tab === item.id ? 'page' : undefined}>{item.label}</button>)}</nav>
    <section className="workspace" aria-labelledby="tool-title"><div className="tool-intro"><p className="eyebrow">{current.hint}</p><h2 id="tool-title">{current.label}</h2></div>
      {tab === 'basic' && <form onSubmit={e => execute(e, 'calculate', [basic], `Cálculo: ${basic}`)}><Field label="Expressão" value={basic} set={setBasic} placeholder="Ex.: sqrt(16) + 2^3"/><Example text="Exemplo: (10 / 2) + sqrt(9)" action={() => setBasic('(10 / 2) + sqrt(9)')}/><Submit busy={busy} label="Calcular"/></form>}
      {tab === 'derivative' && <form onSubmit={e => execute(e, 'derivative', [derivativeExpression, Number(order)], `Derivada: ${derivativeExpression}`)}><Field label="Função de x" value={derivativeExpression} set={setDerivativeExpression} placeholder="Ex.: x^3 + 2*x"/><label>Ordem da derivada<select value={order} onChange={e => setOrder(e.target.value)}>{[1,2,3,4,5].map(n => <option key={n}>{n}</option>)}</select></label><Example text="Exemplo: sin(x) * x^2" action={() => { setDerivativeExpression('sin(x) * x^2'); setOrder('1') }}/><Submit busy={busy} label="Derivar"/></form>}
      {tab === 'quadratic' && <form onSubmit={e => execute(e, 'solveQuadratic', [quadratic.a, quadratic.b, quadratic.c], `2º grau: ${quadratic.a}x² + ${quadratic.b}x + ${quadratic.c}`)}><div className="grid3"><Field label="a" value={quadratic.a} set={v => setQuadratic({...quadratic, a:v})}/><Field label="b" value={quadratic.b} set={v => setQuadratic({...quadratic, b:v})}/><Field label="c" value={quadratic.c} set={v => setQuadratic({...quadratic, c:v})}/></div><p className="formula">ax² + bx + c = 0</p><Example text="Exemplo: x² − 5x + 6 = 0" action={() => setQuadratic({a:'1',b:'-5',c:'6'})}/><Submit busy={busy} label="Encontrar raízes"/></form>}
      {tab === 'integral' && <form onSubmit={e => execute(e, 'integrate', [integral.expression, integral.a, integral.b], `Integral: ${integral.expression}`)}><Field label="Função de x" value={integral.expression} set={v => setIntegral({...integral, expression:v})}/><div className="grid2"><Field label="Limite inferior (a)" value={integral.a} set={v => setIntegral({...integral,a:v})}/><Field label="Limite superior (b)" value={integral.b} set={v => setIntegral({...integral,b:v})}/></div><p className="callout">Resultado aproximado pela regra de Simpson. Funções trigonométricas usam <strong>radianos</strong>.</p><Example text="Exemplo: ∫ sin(x) de 0 a pi" action={() => setIntegral({expression:'sin(x)',a:'0',b:'pi'})}/><Submit busy={busy} label="Integrar aproximadamente"/></form>}
      {tab === 'limit' && <form onSubmit={e => execute(e, 'exploreLimit', [limit.expression, limit.target], `Exploração de limite: ${limit.expression}`)}><Field label="Função de x" value={limit.expression} set={v=>setLimit({...limit,expression:v})}/><Field label="x tende a" value={limit.target} set={v=>setLimit({...limit,target:v})}/><p className="callout">Não é um resolvedor geral. Cinco exemplos em zero têm justificativa matemática; demais entradas mostram amostras com conclusão <strong>inconclusiva</strong>, nunca uma prova inventada.</p><div className="examples">{['sin(x)/x','1/x','1/x^2','sin(1/x)','abs(x)/x'].map(expression=><Example key={expression} text={expression} action={()=>setLimit({expression,target:'0'})}/>)}</div><Submit busy={busy} label="Explorar limite"/></form>}
      {tab === 'riemann' && <form onSubmit={e=>execute(e,'riemann',[riemann.expression,riemann.a,riemann.b,Number(riemann.n),riemann.method],`Riemann: ${riemann.expression}`)}><Field label="Função de x" value={riemann.expression} set={v=>setRiemann({...riemann,expression:v})}/><div className="grid2"><Field label="Limite inferior (a)" value={riemann.a} set={v=>setRiemann({...riemann,a:v})}/><Field label="Limite superior (b)" value={riemann.b} set={v=>setRiemann({...riemann,b:v})}/></div><div className="grid2"><Field label="Retângulos (2 a 200)" value={riemann.n} set={v=>setRiemann({...riemann,n:v})}/><label>Ponto de amostragem<select value={riemann.method} onChange={e=>setRiemann({...riemann,method:e.target.value})}><option value="left">Esquerda</option><option value="midpoint">Ponto médio</option><option value="right">Direita</option></select></label></div><p className="callout">Compare 8, 16 e 32 retângulos com a ferramenta Integral. Aproximação com sinal, não área geométrica total.</p><Submit busy={busy} label="Somar retângulos"/></form>}
      {tab === 'graph' && <form onSubmit={e => execute(e, 'sampleGraph', [graph.expression, Number(graph.min), Number(graph.max)], `Gráfico: ${graph.expression}`)}><Field label="Função de x" value={graph.expression} set={v => setGraph({...graph,expression:v})}/><div className="grid2"><Field label="Mínimo de x" value={graph.min} set={v => setGraph({...graph,min:v})}/><Field label="Máximo de x" value={graph.max} set={v => setGraph({...graph,max:v})}/></div><p className="callout">Visualização aproximada por amostragem; funções trigonométricas usam <strong>radianos</strong>.</p><Example text="Exemplo: sin(x)" action={() => setGraph({expression:'sin(x)',min:'-10',max:'10'})}/><Submit busy={busy} label="Gerar gráfico"/></form>}
      <details className="guide"><summary>Como escrever funções</summary><p>Use x, * para multiplicação, ^ para potência e ponto decimal. sin, cos, tan, sqrt, abs, exp, log e ln são aceitos. Trigonometria em radianos. Por segurança, expoentes devem ser constantes: use exp(x), não e^x.</p><p>Resultados simbólicos continuam sujeitos ao domínio da função original. Gráficos e integrais são aproximações.</p></details>
      {error && <div role="alert" className="error"><strong>Não deu certo:</strong> {error}</div>}
      {result && <ResultCard result={result}/>} {points && <Graph points={points}/>} 
    </section>
    <StudyPanel tab={tab}/>
    <section className="history"><div><p className="eyebrow">NESTE DISPOSITIVO</p><h2>Últimos resultados</h2></div>{history.length > 0 && <button className="text-button" onClick={clearHistory}>Apagar histórico</button>}<p className="privacy">Os cálculos ficam neste dispositivo. O histórico fica só neste navegador; links externos precisam de internet.</p>{history.length ? <ol>{history.map(item => <li key={item.id}><span>{item.label}</span><strong>{item.value}</strong></li>)}</ol> : <p className="empty">Seus resultados recentes aparecerão aqui.</p>}</section>
    <footer><a href="https://github.com/wandersonsaint014-hue/calculo-vx" target="_blank" rel="noreferrer">Repositório do projeto</a><span>•</span><span>Use ponto; uma vírgula decimal fora de funções é aceita</span><span>• No iPhone/iPad: Compartilhar → Adicionar à Tela de Início</span></footer>
  </main>
}

function Field({label,value,set,placeholder}:{label:string;value:string;set:(v:string)=>void;placeholder?:string}) { const id = `field-${label.replace(/[^a-z0-9]/gi,'')}`; return <label htmlFor={id}>{label}<input id={id} value={value} onChange={e=>set(e.target.value)} placeholder={placeholder} required autoComplete="off" spellCheck="false"/></label> }
function Example({text,action}:{text:string;action:()=>void}) { return <button type="button" className="example" onClick={action}>{text}</button> }
function Submit({busy,label}:{busy:boolean;label:string}) { return <button className="submit" disabled={busy} type="submit">{busy ? 'Calculando…' : label}</button> }


function Graph({points}:{points:Point[]}) {
  const chart = useMemo(() => {
    const valid=points.filter(p=>p.y !== null && Number.isFinite(p.y)); if (!valid.length) return null
    const xs=valid.map(p=>p.x), ys=valid.map(p=>p.y as number), xMin=Math.min(...xs),xMax=Math.max(...xs), rawYMin=Math.min(...ys),rawYMax=Math.max(...ys)
    const range=Math.max(rawYMax-rawYMin, 1e-9), yMin=rawYMin-range*.08,yMax=rawYMax+range*.08, W=720,H=330,pad=38
    const sx=(x:number)=>pad+(x-xMin)/(xMax-xMin)*(W-pad*2), sy=(y:number)=>H-pad-(y-yMin)/(yMax-yMin)*(H-pad*2)
    let d='', open=false; for(const p of points){if(p.y===null||!Number.isFinite(p.y)){open=false;continue}const x=sx(p.x),y=sy(p.y as number);if(Number.isFinite(x)&&Number.isFinite(y)){d+=`${open?'L':'M'}${x.toFixed(2)} ${y.toFixed(2)} `;open=true}else open=false}
    return {d,W,H,pad,axisX:yMin<=0&&yMax>=0?sy(0):null,axisY:xMin<=0&&xMax>=0?sx(0):null,xMin,xMax,yMin,yMax}
  },[points])
  if(!chart) return <div className="error" role="alert">Não há pontos reais finitos para desenhar neste intervalo.</div>
  return <figure className="graph"><svg viewBox={`0 0 ${chart.W} ${chart.H}`} role="img" aria-label="Gráfico aproximado da função"><rect width={chart.W} height={chart.H} rx="12"/><line x1={chart.pad} x2={chart.W-chart.pad} y1={chart.H-chart.pad} y2={chart.H-chart.pad}/><line x1={chart.pad} x2={chart.pad} y1={chart.pad} y2={chart.H-chart.pad}/>{chart.axisX!==null&&<line className="axis" x1={chart.pad} x2={chart.W-chart.pad} y1={chart.axisX} y2={chart.axisX}/>} {chart.axisY!==null&&<line className="axis" x1={chart.axisY} x2={chart.axisY} y1={chart.pad} y2={chart.H-chart.pad}/>}<path d={chart.d}/><text x={chart.pad} y={chart.H-12}>{chart.xMin.toPrecision(4)}</text><text x={chart.W-chart.pad} y={chart.H-12} textAnchor="end">{chart.xMax.toPrecision(4)}</text><text x={chart.pad+5} y={chart.pad+14}>{chart.yMax.toPrecision(4)}</text><text x={chart.pad+5} y={chart.H-chart.pad-5}>{chart.yMin.toPrecision(4)}</text></svg><figcaption>Traçado aproximado; descontinuidades e escalas extremas podem alterar a visualização.</figcaption></figure>
}
export default App
