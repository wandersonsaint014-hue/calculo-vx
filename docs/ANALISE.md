# Análise de origem e aprimoramentos

## Evidências verificadas
O repositório privado `wandersonsaint014-hue/C-lculo-VX`, commit `d1787e0d52138f357fe1ae1971b77d8425b56b64`, tinha somente README.md. O texto descreve TanStack Start, React, Math.js, KaTeX, Recharts, limites, integrais simbólicas e 30 testes. Não havia os arquivos de implementação ou testes para verificar essas alegações. O Lovable solicitou login; a URL pública da calculadora não foi localizada. Não foi alterado o projeto original nem seu deploy.

## Direção adotada
Nova implementação com escopo menor e verificável: React + Vite estático, Math.js, SVG e PWA. Evitar servidor/IA neste início reduz custos, exposição de dados e dependência de créditos. Derivadas são simbólicas; integrais e gráficos são numéricos. A interface distingue claramente esses casos.

## Melhorias entregues
- Lista de sintaxe permitida e rejeição de funções/objetos arbitrários.
- Limites de tamanho e complexidade; cálculo isolado do navegador com timeout.
- Precisão decimal configurada em 28 dígitos para aritmética.
- Casos degenerados das equações e mensagens para domínio inválido.
- Histórico local com exclusão, campos rotulados e layout móvel.
- Testes unitários, verificação TypeScript, build, CI e deploy opt-in.
- Instalação web com confirmação do visitante e cache offline.

## Riscos e próximos passos
AST restrito não equivale a sandbox formal. Timeout é uma proteção adicional. Simpson fixo pode errar com funções oscilatórias ou singularidades não amostradas. Bhaskara pode sofrer cancelamento em coeficientes extremos. Acessibilidade, instalação e offline precisam de validação em dispositivos reais. Recuperar código/URL Lovable antes de alegar compatibilidade funcional. Não copiar segredos, arquivos privados ou dados pessoais para o repositório público.
