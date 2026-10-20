# ADR 0001: aplicação estática com motor local

Status: adotada nesta implementação, aberta a revisão via issue.

React + TypeScript + Vite por simplicidade e código editável. Math.js para parsing e cálculo; AST restrita antes de avaliar. SVG próprio evita dependência de gráficos nesta fase. Web Worker permite interromper tarefas. PWA para instalação voluntária sem lojas. Sem backend, telemetria, autenticação ou IA por padrão.

Alternativas adiadas: manter TanStack Start sem código original disponível; Recharts/KaTeX sem necessidade imediata; CAS remoto que exigiria servidor e política de dados. Adicionar apenas com testes e justificativa.
