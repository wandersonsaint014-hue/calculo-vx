import { useEffect, useState } from 'react'
export default function ResultCard({result}:{result:{value:string;steps:string[]}}) {
  const [copyMessage,setCopyMessage] = useState('')
  useEffect(()=>setCopyMessage(''),[result])
  const copy = async()=>{try{await navigator.clipboard.writeText([result.value,...result.steps].join('\n'));setCopyMessage('Copiado')}catch{setCopyMessage('Não foi possível copiar. Selecione o texto.')}}
  return <article className="result" aria-live="polite"><div className="result-header"><p className="eyebrow">RESULTADO</p><button type="button" className="example" onClick={copy}>Copiar resultado e método</button></div>{copyMessage&&<p role="status">{copyMessage}</p>}<output>{result.value}</output><h3>Procedimento e ressalvas</h3><ol>{result.steps.map((step,index)=><li key={index}>{step}</li>)}</ol></article>
}
