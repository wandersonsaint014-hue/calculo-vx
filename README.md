# Cálculo VX

Calculadora aberta em português, feita com React, TypeScript, Vite e Math.js. Código editável, testes e instalação como aplicativo web (PWA), sem conta ou chave de API.

> Nova implementação independente. O repositório anterior `C-lculo-VX` contém somente um README. Seu código Lovable não foi acessado, portanto isto não é uma migração nem uma auditoria da versão publicada. Veja [a análise](docs/ANALISE.md).

## O que já funciona
- Aritmética decimal com 28 algarismos significativos (não significa exatidão universal).
- Derivadas simbólicas de ordem 1 a 5.
- Equações de segundo e primeiro grau, incluindo casos degenerados e sem raízes reais.
- Integral definida **aproximada**, por Simpson, comparando 500, 1.000 e 2.000 subintervalos.
- Somas de Riemann configuráveis (2 a 200 retângulos).
- Exploração de limites: cinco exemplos demonstrados em zero; outras entradas são inconclusivas.
- Conteúdo educacional, referências e cópia de resultados com procedimento.
- Gráfico SVG amostrado em 401 pontos.
- Histórico local apagável; nenhum cálculo é enviado a servidores.
- Trabalho pesado em Web Worker, interrompido após 8 segundos.
- PWA com cache offline e atualização a pedido, após primeiro acesso online.

## Rodar e modificar
Requer Node.js 20.19+ (recomendado 22) e pnpm 10.28.2.

```sh
corepack enable
corepack prepare pnpm@10.28.2 --activate
git clone https://github.com/wandersonsaint014-hue/calculo-vx.git
cd calculo-vx
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm test
pnpm typecheck
pnpm build
pnpm preview
```

`src/engine.ts`: regras matemáticas e segurança. `src/engine.test.ts`: testes. `src/App.tsx`: interface. `src/worker.ts`: isolamento. `src/styles.css`: aparência. `vite.config.ts`: instalação/offline.

## Publicação e instalação

[![Publicar no Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/wandersonsaint014-hue/calculo-vx)

O botão inicia uma publicação na conta de quem clicar; não instala nem contrata nada sem as etapas do provedor. Também há fluxo manual de GitHub Pages em Actions: é preciso configurar **Settings → Pages → Source: GitHub Actions**, depois executar **Publicar Pages**. O site só existe depois de o deploy concluir.

Em HTTPS, visite o site e toque em **Instalar app** quando o navegador oferecer. No Android: menu → Instalar aplicativo/Adicionar à tela inicial. No iPhone/iPad: Safari → Compartilhar → Adicionar à Tela de Início. O navegador exige confirmação; instalação silenciosa não é permitida. Sem loja/APK nesta versão.

## Sintaxe e limites
Use `*`, `/`, `^`, parênteses e `x`. Funções: `sin`, `cos`, `tan`, `sqrt`, `abs`, `exp`, `log`, `ln`; constantes `pi`, `e`. Trigonometria em radianos. Prefira ponto decimal; uma vírgula fora de funções é aceita (`1,5 + 2`). Argumentos múltiplos, atribuições e acesso a propriedades são bloqueados. Expoentes precisam ser constantes numéricas entre -1000 e 1000. Domínio real apenas.

Integrais usam ponto flutuante e não herdam a precisão decimal da aritmética. Descontinuidades entre amostras podem passar despercebidas. Gráficos também são aproximações. Não há resolvedor geral de limites, integrais simbólicas, prova passo a passo completa, verificação numérica de derivadas ou IA remota implementados. Os passos apresentados são resumos do procedimento.

## Participar

Ideias são revisadas pela [política de governança](docs/GOVERNANCA.md): preservar o conceito, avaliar evidências e justificar decisões. Sugestões discutíveis ficam registradas; desvios claros podem ser recusados.
Abra uma [issue](https://github.com/wandersonsaint014-hue/calculo-vx/issues) ou pull request. Propostas aguardando avaliação ficam em [ROADMAP](docs/ROADMAP.md); decisões são registradas em [ADRs](docs/decisions/0001-arquitetura.md). Consulte [CONTRIBUTING](CONTRIBUTING.md), [SECURITY](SECURITY.md) e [privacidade](docs/PRIVACIDADE.md).

Licença MIT. Projeto educacional: confira resultados importantes de forma independente.

O lockfile validado continua compactado em `scripts/lock-*.txt`; `node scripts/lock.mjs` o restaura sem rede antes da instalação congelada.

## Estado da validação

Testes automatizados, tipagem e build devem ser confirmados a cada alteração. A bateria visual anterior teve evidência parcial em 320 px, mas não aprovou desktop/tablet, instalação real ou recarga totalmente offline. Não há prévia publicada nesta revisão. Veja [registro técnico](docs/REVISAO-OTIMIZADA.md).

Amostragem numérica recusa extremos indistinguíveis e malhas sem resolução em ponto flutuante. O gráfico aceita extremos como `-1,5` e `pi`. Quebras de curva são conservadoras e podem interromper funções muito íngremes; não constituem detecção geral de descontinuidades.
