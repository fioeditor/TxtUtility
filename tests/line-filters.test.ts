import test from 'node:test';
import assert from 'node:assert/strict';
import {runOperation, tools} from '../lib/operations';
const apply = (text: string, options: Record<string,string>) => runOperation('filter',text,options);

test('Remove Lines Containing removes the whole line, not just the term', () => {
  assert.equal(apply('ok\nERROR failed\nfine\nfailure ERROR', {term:'ERROR',mode:'remove'}).text, 'ok\nfine');
  assert.equal(apply('ok\nERROR failed\nfine', {term:'ERROR'}).text, 'ok\nfine');
});
test('filters by start, end and exact line', () => {
  const text = 'abc\nxabc\nabcx\nxabcx';
  assert.equal(apply(text,{term:'abc',mode:'keep',matchType:'starts'}).text, 'abc\nabcx');
  assert.equal(apply(text,{term:'abc',mode:'keep',matchType:'ends'}).text, 'abc\nxabc');
  assert.equal(apply(text,{term:'abc',mode:'keep',matchType:'exact'}).text, 'abc');
  assert.equal(apply(text,{term:'abc',mode:'remove',matchType:'exact'}).text, 'xabc\nabcx\nxabcx');
});
test('case sensitivity and regex are independent of the literal match type', () => {
  assert.equal(apply('Error\nerror\nOK',{term:'error',ignoreCase:'true',mode:'remove'}).text, 'OK');
  assert.equal(apply('Error\nerror\nOK',{term:'error',ignoreCase:'false',mode:'remove'}).text, 'Error\nOK');
  assert.equal(apply('a1\nb2\nOK',{term:'\\d',regex:'true',matchType:'exact',mode:'remove'}).text, 'OK');
});
test('catalog makes removing lines explicit and rejects an invalid match type', () => {
  const filter = tools.find(item=>item.id==='filter')!;
  assert.match(filter.name,/Remove/);
  assert.equal(filter.fields.find(field=>field.key==='mode')!.defaultValue,'remove');
  assert.throws(()=>apply('abc',{term:'a',matchType:'invalid'}));
});
