# TextUtility

Ferramenta local de edição em lote para limpar, transformar, ordenar, filtrar e comparar texto. A interface é em português; o conteúdo editado fica no navegador.

> Repositório: [github.com/fioeditor/TxtUtility](https://github.com/fioeditor/TxtUtility). A licença continua pendente de escolha do mantenedor.

## Começar

Requer Node.js 22+ e npm. Instale com `npm ci` e inicie com `npm run dev`. No ambiente Manus, o Preview usa a porta declarada para a sessão. Nenhuma API, conta ou banco é necessário.

Antes de enviar alterações, rode `npm test`, `npm run typecheck` e `npm run build`. A exportação estática vai para `out/`; o workflow `.github/workflows/ci.yml` roda as mesmas verificações em push e pull request. Veja [CONTRIBUTING.md](CONTRIBUTING.md) para as práticas de contribuição.

## Ferramentas

A barra de busca encontra ações por nome ou tarefa; `Ctrl+K` abre a busca. Os atalhos da categoria ativa ficam visíveis abaixo das categorias. As operações abrangem limpeza de linhas e palavras, transformações de caixa, afixos, numeração, ordenação, filtros, divisão/junção, extração e operações entre listas.

O filtro de linhas permite **remover** ou **manter** linhas que contêm um termo, começam/terminam com ele ou correspondem exatamente. Também aceita regex e diferenciação de caixa. Pré-visualização, seleção, undo/redo e **restauração das dez edições mais recentes** estão disponíveis no editor.

Importe `.txt` ou `.csv` em UTF-8 ou cole texto. Importar e carregar um exemplo pedem confirmação antes de substituir um texto não vazio. CSV é tratado como texto delimitado; a extração de coluna não interpreta campos CSV entre aspas nem campos multilinha. Arquivos importados têm limite de 4 MB; o texto processado, de 2 milhões de unidades UTF-16. Expressões regulares seguem JavaScript. A substituição da busca é literal e não expande `$1` ou grupos similares.

## Privacidade e armazenamento

Transformações e importação rodam no cliente; o conteúdo não é enviado a um servidor do TextUtility. O rascunho atual persiste em `localStorage` neste navegador. O histórico de até dez edições é transitório, vale para a sessão e não é salvo. O carregamento de fontes do Google pode gerar uma requisição ao Google Fonts; os textos do usuário não fazem parte dessa requisição.

## Repositório e licença

O código está em [fioeditor/TxtUtility](https://github.com/fioeditor/TxtUtility). Copie `.env.example` para `.env` se precisar de overrides locais; o `.env` não entra no Git. Escolha e adicione a licença adequada antes de tratar o projeto como redistribuível.
