# Contribuindo com o TextUtility

Obrigado por ajudar a melhorar uma ferramenta de texto local e aberta a contribuições. O repositório é um placeholder e esta política ainda não autoriza redistribuição: a licença será escolhida pelo mantenedor antes da disponibilização pública.

## Começar

Use Node.js 22 ou superior e npm. Instale dependências com `npm ci`. Para executar localmente use `npm run dev`. Antes de propor uma alteração, rode `npm test`, `npm run typecheck` e `npm run build`.

## Mudanças

Prefira operações puras em `lib/operations.ts`, isoladas e testadas em `tests/`. Não envie o texto editado a endpoints nem acrescente analytics que leiam o conteúdo. Mantenha navegação acessível por teclado, rótulos claros, operação reversível e `prefers-reduced-motion`. Confirme antes de uma ação que possa substituir o conteúdo do editor.

Pull requests devem explicar o caso de uso, descrever comportamento/limites novos e incluir testes para a transformação. Não inclua arquivos de rascunho, saída de build, `.env`, credenciais ou conteúdo real de usuários.

## Pendências de publicação

Substitua `https://github.com/SEU_USUARIO/textutility` em `lib/project.ts` pelo repositório efetivo e atualize `README.md`. Escolha e adicione a licença apropriada antes de chamar o projeto de licenciado ou aceitar redistribuição. Configure links reais de issues/segurança quando o repositório existir.
