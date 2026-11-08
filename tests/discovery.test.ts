import test from 'node:test';
import assert from 'node:assert/strict';
import {searchTools} from '../lib/discovery';

test('descobre ferramenta por tarefa, sinônimo e variação de acento', () => {
  assert.equal(searchTools('remover linhas que contêm erro')[0]?.tool.id, 'filter');
  assert.equal(searchTools('apagar linhas em branco')[0]?.tool.id, 'empty');
  assert.equal(searchTools('numerar linhas')[0]?.tool.id, 'number');
  assert.equal(searchTools('extrair acentos')[0]?.tool.id, 'accents');
  assert.equal(searchTools('remover linhas que contem')[0]?.tool.id, 'filter');
});
test('seleciona o modo de manter quando a tarefa diz preservar/manter', () => {
  const keep = searchTools('manter linhas que contêm aviso')[0];
  assert.equal(keep?.tool.id, 'filter');
  assert.equal(keep?.mode, 'keep');
  const remove = searchTools('remover linhas que contêm aviso')[0];
  assert.equal(remove?.tool.id, 'filter');
  assert.equal(remove?.mode, 'remove');
});
test('texto vazio não sugere ação, resultados são limitados e filtráveis', () => {
  assert.deepEqual(searchTools('   '), []);
  assert.ok(searchTools('linhas').length > 0, 'termos genéricos mostram ações relacionadas');
  assert.deepEqual(searchTools(' da de e '), []);
  assert.ok(searchTools('ordenar')['length'] <= 6);
});
