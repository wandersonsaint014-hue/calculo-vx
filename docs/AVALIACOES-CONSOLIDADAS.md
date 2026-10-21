# Avaliações consolidadas do Cálculo VX

Este registro integra as avaliações técnicas e de ferramentas já realizadas. Documentar uma alternativa não significa aprovar sua implementação. Referência de código examinada antes desta integração documental: `33179e6029b0635195b4d27f657a21f5eed77f6b` em `main`.

## O que já está incorporado no código

- Implementação independente em React, TypeScript, Vite e Math.js. O código privado Lovable não foi obtido; não houve migração nem correção comprovada do site original.
- Aritmética decimal, derivadas, equações, integração aproximada, Riemann, exemplos limitados de limites, gráfico e histórico local.
- Amostragem compilada por operação e proteção contra intervalos numericamente indistinguíveis.
- Correção de estabilidade das raízes quadráticas, com arquivo `src/quadratic-stability.test.ts`: cancelamento numérico, resíduos relativos, produto das raízes, sinais, zeros e raízes duplas.
- Governança, contribuição, modelos de issue/PR e CI. O simples fato de existir um workflow não comprova uma execução aprovada.

## Evidências e limites

Os documentos de revisão anteriores preservam resultados das respectivas revisões, não aprovações automáticas da versão atual. Na continuidade mais recente foram observados 12 testes de estabilidade e 31 testes do motor aprovados em execuções parciais. Não há bateria completa consolidada dessa etapa. Uma tentativa de build Vite terminou com código 137; pressão de recursos é hipótese, não causa comprovada. Outra tentativa falhou por ausência do comando npm no ambiente.

A correção das raízes já consta de `main`; não deve permanecer descrita como totalmente não implementada. Ainda cabem testes adicionais e validação integral da revisão candidata. Testes finitos não provam correção matemática universal.

## Publicação, interface e instalação: estados independentes

- A API pública do GitHub confirmou repositório público (`private=false`, `visibility=public`). Isso não publica o site.
- Última tentativa de Pages registrada: a branch `main` não estava autorizada pelas regras do ambiente `github-pages`. Não há confirmação de deploy público concluído nessa etapa. Nenhuma proteção foi alterada.
- Endereço esperado, não confirmado como calculadora publicada: https://wandersonsaint014-hue.github.io/calculo-vx/
- O workflow atual contempla push em `main` e execução manual; mudanças somente em Markdown são ignoradas para publicação.
- Interface pública, acessibilidade completa, instalação real, atualização e recarga totalmente offline permanecem sem aprovação nesta continuidade.
- PWA exige HTTPS e consentimento do visitante; não há instalação silenciosa nem APK demonstrado.

## Alternativa portátil avaliada

Foi criada uma cópia isolada baseada no commit de referência e gerado localmente um HTML único de aproximadamente 916 KB, com JavaScript e Worker embutidos e sem registro de service worker.

**Decisão: experimental, guardada para validação.** A abertura e os cálculos no navegador não tiveram resultado conclusivo consolidado. O arquivo local não foi publicado nem entregue como versão aprovada. Não integra a distribuição estável e não é apresentado como PWA instalável. Arquivos temporários e cópias locais não equivalem a código publicado em `main`.

Antes de distribuir: preservar a fonte reproduzível, concluir a compilação, testar abertura por arquivo local e por HTTPS, cálculos de referência, erros, Worker e navegadores móveis. Só afirmar operação sem rede quando observada especificamente nesse formato.

## Decisões para ferramentas e propostas

- [Agentes de programação avaliados](AGENTES-AVALIADOS.md): pareceres e fontes, sem contratação, instalação ou concessão de acesso.
- [Roadmap](ROADMAP.md): separar funcionalidades incorporadas das propostas pendentes.
- [Governança](GOVERNANCA.md): branch, revisão, evidências, licença, custo e privacidade antes de integrar funcionalidades novas.
- CAS geral, IA explicativa, Simpson adaptativo, KaTeX e exportação continuam propostas, não funcionalidades concluídas.

## Critérios para próxima versão pública

1. Instalação reproduzível, testes completos, tipagem e build aprovados no mesmo commit candidato.
2. Interface e acessibilidade verificadas em mobile, tablet e desktop.
3. Deploy HTTPS comprovado na URL com `/calculo-vx/`, separadamente de visibilidade do repositório.
4. Instalação, atualização e offline verificados por plataforma, sem extrapolar resultados.

Fonte complementar: [Cálculo VX · projeto e decisões no Notion](https://app.notion.com/p/400de0d9d03c8199b5e1f3ef7f412ee8). Este documento não contém credenciais e não modifica permissões administrativas.
