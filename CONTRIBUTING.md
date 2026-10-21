# Contribuir com o Cálculo VX

Pessoas e ideias são bem-vindas. Leia a [direção e política de revisão](docs/GOVERNANCA.md) antes de propor uma mudança. Discordância técnica respeitosa ajuda o projeto; desvio de propósito não precisa virar funcionalidade.

## Erros e propostas
- Erro matemático: expressão, domínio, resultado obtido, resultado esperado e referência independente.
- Interface/instalação: navegador, sistema, tamanho de tela, passos e captura sem dados pessoais.
- Ideia: problema real, relação com o conceito, alternativas, critérios de aceitação, licença, privacidade, custo e impacto no offline/tamanho.
- Vulnerabilidade: siga SECURITY.md; não exponha segredo ou exploração em issue pública.

Propostas discutíveis ficam nas issues e no ROADMAP, sem anúncio como funcionalidade entregue. A avaliação pode aceitar, pedir evidência, guardar ou recusar com justificativa. Mudanças centrais dependem do proprietário.

## Alterar e testar
Requer Node.js 20.19+ e pnpm 10.28.2. Faça fork ou crie branch, execute `node scripts/lock.mjs`, `pnpm install --frozen-lockfile`, `pnpm test`, `pnpm typecheck` e `pnpm build`. O lockfile é restaurado dos arquivos compactados versionados em scripts/; mudanças de dependências devem atualizar esses arquivos de forma consistente. Nunca adicione node_modules, dist, credenciais ou dados pessoais.

Envie PR pequeno com problema, solução, evidências e limitações. Não chame teste de unidade de validação visual, nem existência do service worker de teste offline. Informe testes não executados. Execute código de terceiros apenas em ambiente isolado e revisado. Mantenha interface/documentação em português e preserve licença e autoria.
