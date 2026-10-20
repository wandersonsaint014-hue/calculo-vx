# Revisão funcional da versão publicada

URL fornecida pelo autor: https://calculo-inteligente-vx.lovable.app/

Esta revisão observa a interface e testa entradas no navegador. Não houve acesso ao código-fonte, portanto não constitui auditoria de implementação. Complementa docs/ANALISE.md: o endereço público agora é conhecido e foi acessado; o código Lovable continua indisponível.

## Recursos observados

Aritmética, equações, limites, derivadas de até terceira ordem, integrais definidas e indefinidas, visualização, explicações com notação matemática, soma de Riemann e links educacionais. Navegação para conteúdos básicos, intermediários e avançados. A versão Lovable possui recursos pedagógicos que a nova base ainda não reproduz integralmente. A nova implementação não deve ser anunciada como substituta equivalente.

## Casos executados

- Conta `0.1 + 0.2`: resultado `0.3`, correto.
- Derivada padrão de `x^3 - 3x + 1`: `3*x^2 - 3`, correto; interface mostra regras e informa verificação numérica. Essa verificação interna não foi auditada.
- Limite `sin(x)/x`, x tendendo a 0: `1`, correto.
- Integral de `x^2` entre 0 e 1: `0.333333`, aproximação correta de 1/3, com primitiva exibida.
- Limite `1/x`, x tendendo a 0: diz que não existe, conclusão bilateral correta; porém apresenta amostras -1000000 e 1000000 como limites laterais, quando o comportamento lateral é divergente a menos e mais infinito.
- Limite `1/x^2`, x tendendo a 0: exibe `1000000000000` como resultado e como limites laterais. INCORRETO: a função diverge a mais infinito dos dois lados; não possui limite real finito. O número observado é compatível com uma amostra próxima de zero, não uma prova de limite.
- Limite `sin(1/x)`, x tendendo a 0: conclusão de inexistência correta, mas os valores -0.349994 e 0.349994 apresentados como limites laterais são amostras; ambos os limites laterais também não existem por oscilação.

## Prioridades

1. Não transformar amostras numéricas em limites exatos. Distinguir valor finito, divergência infinita, oscilação e caso inconclusivo.
2. Acrescentar testes de regressão para 1/x, 1/x² e sin(1/x) antes de portar limites para a nova base. Convergência de poucas amostras não é prova.
3. Preservar explicações, notação e navegação pedagógica ao evoluir a interface.
4. Separar resultados exatos e aproximados na apresentação.
5. A referência de continuidade abriu resumo ambíguo da Wikipédia (ficção/contabilidade). Usar tópico específico de função contínua.

Nenhuma alteração foi feita no site Lovable publicado. Correções nele exigem acesso ao projeto/código. Esta revisão não verifica instalação mobile, offline, segurança interna ou todos os casos matemáticos.
