import test from 'node:test';
import assert from 'node:assert/strict';
import {runOperation, tools} from '../lib/operations';
const apply = (text: string, options: Record<string,string>) => runOperation('filter',text,options);

test('Remove Lines Containing remove a linha inteira, não somente o termo', () => {
  assert.equal(apply('ok\nERROR falhou\nbeleza\nfalha ERROR', {term:'ERROR',mode:'remove'}).text, 'ok\nbeleza');
  assert.equal(apply('ok\nERROR falhou\nbeleza', {term:'ERROR'}).text, 'ok\nbeleza');
});
test('filtra por início, fim e linha exata', () => {
  const text = 'abc\nxabc\nabcx\nxabcx';
  assert.equal(apply(text,{term:'abc',mode:'keep',matchType:'starts'}).text, 'abc\nabcx');
  assert.equal(apply(text,{term:'abc',mode:'keep',matchType:'ends'}).text, 'abc\nxabc');
  assert.equal(apply(text,{term:'abc',mode:'keep',matchType:'exact'}).text, 'abc');
  assert.equal(apply(text,{term:'abc',mode:'remove',matchType:'exact'}).text, 'xabc\nabcx\nxabcx');
});
test('diferenciar caixa e regex independem do critério literal', () => {
  assert.equal(apply('Erro\nerro\nOK',{term:'erro',ignoreCase:'true',mode:'remove'}).text, 'OK');
  assert.equal(apply('Erro\nerro\nOK',{term:'erro',ignoreCase:'false',mode:'remove'}).text, 'Erro\nOK');
  assert.equal(apply('a1\nb2\nOK',{term:'\\d',regex:'true',matchType:'exact',mode:'remove'}).text, 'OK');
});
test('catálogo deixa remover linhas explícito e rejeita critério inválido', () => {
  const filter = tools.find(item=>item.id==='filter')!;
  assert.match(filter.name,/Remover/);
  assert.equal(filter.fields.find(field=>field.key==='mode')!.defaultValue,'remove');
  assert.throws(()=>apply('abc',{term:'a',matchType:'invalido'}));
});
