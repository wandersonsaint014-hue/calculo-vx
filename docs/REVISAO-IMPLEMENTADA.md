# Revisão independente para avaliação

Branch `melhoria/referencia-lovable`. Não altera o site Lovable nem conecta os projetos.

## Entregue
- Limites: justificativas próprias para 1/x², 1/x, sin(1/x), sin(x)/x e abs(x)/x em zero. Outras entradas permanecem inconclusivas, com amostras claramente identificadas.
- Riemann com 2 a 200 retângulos, esquerda, direita e ponto médio.
- Simpson com comparação de três malhas; diferença entre malhas não é garantia de erro.
- Detecção conservadora de raízes de denominadores polinomiais até grau dois. Não é detecção geral de singularidades.
- Explicação de cada ordem derivada, guia de sintaxe, referências e cópia de procedimento.
- Constantes entre parênteses reconhecidas na validação de expoentes.

## Verificação
50 testes aprovados e TypeScript sem erros. Build de produção e geração PWA aprovados novamente após o ajuste final de constantes.
Teste visual não concluído: navegador remoto não alcança a prévia local e instalação de navegador local excedeu espaço disponível. Não há validação visual/mobile ou offline real confirmada.

## Referências
- https://openstax.org/books/calculus-volume-1/pages/2-2-the-limit-of-a-function
- https://openstax.org/books/calculus-volume-2/pages/3-6-numerical-integration
- https://mathjs.org/docs/expressions/security.html

Conteúdo próprio baseado em conceitos e comportamento público observado. Não foi copiado código privado do Lovable.

## Ainda em discussão
Resolvedor simbólico geral de limites, desenho dos retângulos, passos algébricos completos, revisão de acessibilidade e deploy HTTPS. Instalação de PWA requer ação e confirmação do navegador, nunca instalação silenciosa.
