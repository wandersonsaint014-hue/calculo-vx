# Revisão otimizada

## Alterações
- Expressões são compiladas uma vez por operação de amostragem, sem cache compartilhado entre entradas. Não foi medido benchmark comparativo; a otimização remove recompilação por ponto sem alegar percentual de ganho.
- Integração, Riemann e gráficos recusam extremos indistinguíveis em Number e malhas sem resolução. Comparação dos extremos originais usa igualdade decimal exata, não tolerância numérica.
- Extremos do gráfico usam o mesmo parser restrito, aceitando vírgula decimal fora de funções e constantes como pi.
- Quebras conservadoras de curvas em saltos extremos ou mudanças de sinal de grande magnitude. Heurística, não prova de continuidade; pode interromper curvas válidas íngremes.
- Proteção adicional contra submissão durante operação ocupada.
- Lockfile padrão na raiz; CI e publicação manual usam instalação congelada sem restauração de arquivo compactado.
- Governança, contribuição e modelos de issue/PR deixam explícitos conceito, evidências e critérios para revisão de ideias.

## Evidências desta revisão
- Vitest: **58 testes aprovados**, em três arquivos, execução com um worker.
- TypeScript: `tsc --noEmit` aprovado.
- Build Vite/PWA aprovado; precache gerado com 12 entradas (~903 KiB). Isso NÃO é teste de recarga offline.
- `pnpm install --lockfile-only --ignore-scripts --frozen-lockfile --offline` aprovado. Não equivale a instalação limpa do zero.
- `git diff --check` aprovado.

## Pendências preservadas
Validação visual completa de desktop/tablet, fluxos em dispositivos reais, instalação Android/iOS e recarga offline. A evidência visual anterior em 320 px continua parcial. Precisão decimal é de 28 dígitos; integrais, Riemann e gráficos usam ponto flutuante. Amostragem pode ocultar singularidades e oscilações. Não há novo deploy, prévia ou alteração do Lovable.

Issues #4 (casos extremos/domínio e estabilidade) e #5 (validação mobile/acessibilidade) continuam pertinentes e abertas. As melhorias não encerram essas investigações.
