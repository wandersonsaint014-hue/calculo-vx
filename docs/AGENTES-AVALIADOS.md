# Agentes de programação: avaliação registrada

Pesquisa já realizada para apoiar o desenvolvimento do Cálculo VX. Não são componentes da calculadora e não devem tornar o cálculo dependente de serviços remotos.

## GitHub Copilot coding agent

**Parecer:** candidato prioritário para tarefas centradas no GitHub: examinar código, propor alterações, executar testes e preparar pull requests. Plano, disponibilidade, permissões e custos devem ser confirmados antes da ativação.

**Estado:** avaliado, não ativado; nenhum acesso novo concedido.

Fonte: https://docs.github.com/en/copilot/concepts/coding-agent/coding-agent

## OpenHands

**Parecer:** alternativa quando controle de infraestrutura e execução local ou remota forem prioritários. SDK e ferramentas para edição, comandos e integração MCP; o SDK consultado é documentado como MIT. Exige configuração técnica, isolamento e avaliação do componente específico a utilizar. Código aberto não torna modelos ou infraestrutura gratuitos.

**Estado:** guardado para análise; não instalado nem configurado.

Fonte: https://docs.openhands.dev/sdk

## Aider

**Parecer:** adequado à edição acompanhada em repositório Git, com diferentes modelos e apoio a testes. Não equivale a um serviço autônomo já configurado.

**Estado:** guardado para uso acompanhado; não instalado nem configurado.

Fonte: https://aider.chat/docs/

## Condições comuns de integração efetiva

- Trabalhar em branch separada e apresentar alterações revisáveis.
- Executar testes, tipagem e build; indicar exatamente o commit e as falhas.
- Não incluir segredos no código, instruções, logs ou cliente web.
- Não contratar planos, conceder permissões adicionais ou alterar proteções sem autorização específica.
- Não executar código de contribuintes sem revisão e autorização, conforme governança.
- Não enviar expressões dos usuários a modelos externos sem consentimento.
- IA não é autoridade matemática; resultados exigem referências e testes independentes.

A solicitação de consolidar avaliações no repositório não é ativação ou contratação dessas ferramentas. As instruções de contribuição existentes continuam prevalecendo. Não foram adicionados SDKs, chaves, automações recorrentes ou dependências de agentes.
