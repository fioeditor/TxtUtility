'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUp, ArrowUpRight, Check, ChevronDown, Copy, Download, FileText, History, Import, ListFilter, LockKeyhole, Code2, Maximize2, Minimize2, RotateCcw, Search, Eraser, Trash2, Undo2, Redo2, X, Settings2, ListOrdered, Layers, Keyboard, WrapText } from 'lucide-react';
import { tools, runOperation, type Tool } from '@/lib/operations';
import { clampRange, replaceRange, findMatches, replaceLiteralMatches, lineWindow } from '@/lib/editor';
import { searchTools, type OperationResult } from '@/lib/discovery';
import { branchHistory, restoreHistory, MAX_HISTORY_EDITS, retainHistory } from '@/lib/history';
import { repositoryUrl } from '@/lib/project';

const KEY = 'textutility.draft.v1';
const MAX_TEXT = 2_000_000;
const EXAMPLE_LABEL = 'Carregar exemplo';
const categories = [
  { id: 'clean', name: 'Limpar', icon: Eraser, hint: 'Espaços, duplicatas e caracteres.' },
  { id: 'transform', name: 'Transformar', icon: Settings2, hint: 'Caixa, afixos e numeração.' },
  { id: 'lines', name: 'Linhas', icon: ListOrdered, hint: 'Ordenação, filtros e delimitadores.' },
  { id: 'lists', name: 'Listas', icon: Layers, hint: 'Comparação, mesclagem e amostragem.' },
] as const;
const demo = '  Café Aurora  \nEstúdio Norte\nCafé Aurora\n\nBiblioteca Central\n  Mercado Verde\nEstúdio Norte\nAteliê Horizonte\n';
type Snapshot = { text: string; label: string; detail: string; serial: number };
type Notice = { text: string; kind: 'success' | 'error' } | null;
const defaults = (tool: Tool) => Object.fromEntries(tool.fields.map(field => [field.key, field.defaultValue]));
const countLines = (text: string) => text.length ? text.split('\n').length : 0;

export default function Workspace() {
  const reduced = useReducedMotion();
  const [text, setText] = useState('');
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState('Rascunho local');
  const [category, setCategory] = useState<Tool['category']>('clean');
  const [toolId, setToolId] = useState('dedupe');
  const tool = tools.find(item => item.id === toolId) ?? tools[0];
  const [options, setOptions] = useState<Record<string, string>>(() => defaults(tool));
  const [scope, setScope] = useState<'all' | 'selection'>('all');
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [wrap, setWrap] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [replacement, setReplacement] = useState('');
  const [regex, setRegex] = useState(false);
  const [matchCase, setMatchCase] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [replaceOpen, setReplaceOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState(-1);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [cursor, setCursor] = useState(0);
  const [notice, setNotice] = useState<Notice>(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const [toolQuery, setToolQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const toolSearch = useRef<HTMLInputElement>(null);
  const serial = useRef(0);
  const editor = useRef<HTMLTextAreaElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const source = scope === 'selection' ? text.slice(selection.start, selection.end) : text;
  const hasSelection = selection.end > selection.start;

  useEffect(() => {
    let draft = '';
    try { draft = localStorage.getItem(KEY)?.slice(0, MAX_TEXT) ?? ''; } catch { setSaved('Salvamento indisponível'); }
    setText(draft);
    setSnapshots([{ text: draft, label: 'Início da sessão', detail: 'Rascunho restaurado', serial: 0 }]);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    setSaved('Salvando…');
    const timer = setTimeout(() => {
      try { localStorage.setItem(KEY, text); setSaved('Salvo neste navegador'); }
      catch { setSaved('Somente nesta sessão'); }
    }, 300);
    return () => clearTimeout(timer);
  }, [text, ready]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (!ready || snapshots[cursor]?.text === text) return;
    const timer = setTimeout(() => {
      const next = retainHistory(branchHistory(snapshots, cursor).concat({ text, label: 'Edição manual', detail: String(Array.from(text).length) + ' caracteres', serial: ++serial.current }));
      setSnapshots(next); setCursor(next.length - 1);
    }, 600);
    return () => clearTimeout(timer);
  }, [text, ready, snapshots, cursor]);

  const notify = (message: string, kind: 'success' | 'error' = 'success') => setNotice({ text: message, kind });
  function chooseTool(id: string, presetMode?: 'remove' | 'keep') {
    const next = tools.find(item => item.id === id);
    if (!next) return;
    setToolId(next.id); setCategory(next.category); setOptions({ ...defaults(next), ...(next.id === 'filter' && presetMode ? { mode: presetMode } : {}) });
  }
  const searchResults = useMemo(() => searchTools(toolQuery), [toolQuery]);
  function selectToolResult(result: OperationResult) {
    chooseTool(result.tool.id, result.mode); setToolQuery(''); setSearchOpen(false); setActiveSearchIndex(0);
  }
  function chooseCategory(id: Tool['category']) {
    const first = tools.find(item => item.category === id);
    if (first) chooseTool(first.id);
  }
  function commit(next: string, label: string, detail: string) {
    if (next.length > MAX_TEXT) return notify('O resultado excede o limite de 2 milhões de caracteres.', 'error');
    if (next === text) return notify('O texto já está nesse formato. Nada mudou.');
    let base = branchHistory(snapshots, cursor);
    if (!base.length || base.at(-1)?.text !== text) base.push({ text, label: 'Edição manual', detail: `${text.length} caracteres`, serial: ++serial.current });
    base.push({ text: next, label, detail, serial: ++serial.current });
    base = retainHistory(base);
    setSnapshots(base); setCursor(base.length - 1); setText(next); setSelection({ start: 0, end: 0 }); setActiveMatch(-1);
    notify(label);
  }
  function restoreHistoryItem(index: number) {
    if (index === cursor && snapshots[cursor]?.text === text) return;
    const pending = snapshots[cursor]?.text !== text
      ? { text, label: 'Edição manual', detail: 'Texto atualizado', serial: ++serial.current }
      : undefined;
    const restored = restoreHistory(snapshots, cursor, index, pending);
    if (!restored) return;
    setSnapshots(restored.states); setText(restored.state.text); setCursor(restored.cursor);
    setSelection({ start: 0, end: 0 }); setActiveMatch(-1);
    notify('Versão restaurada: ' + restored.state.label);
  }
  function loadExample() {
    if (text && !window.confirm('Carregar o exemplo substituirá o texto atual. Você poderá desfazer essa troca. Continuar?')) return;
    commit(demo, EXAMPLE_LABEL, 'Lista demonstrativa para experimentar');
  }
  function undo() {
    if (snapshots[cursor]?.text !== text) {
      const next = retainHistory(branchHistory(snapshots, cursor).concat({ text, label: 'Edição manual', detail: 'Texto atualizado', serial: ++serial.current }));
      const targetIndex = Math.max(0, next.length - 2);
      setSnapshots(next); setCursor(targetIndex); setText(next[targetIndex].text);
    } else if (cursor > 0) { setCursor(cursor - 1); setText(snapshots[cursor - 1].text); }
    setSelection({ start: 0, end: 0 }); setActiveMatch(-1);
  }
  function redo() {
    if (cursor < snapshots.length - 1 && snapshots[cursor]?.text === text) { setCursor(cursor + 1); setText(snapshots[cursor + 1].text); }
    setSelection({ start: 0, end: 0 }); setActiveMatch(-1);
  }
  useEffect(() => {
    function keys(event: KeyboardEvent) {
      if (!(event.ctrlKey || event.metaKey)) return;
      if (event.key.toLowerCase() === 'f') { event.preventDefault(); setFindOpen(true); setTimeout(() => search.current?.focus(), 0); }
      if (event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); toolSearch.current?.focus(); }
      if (event.target !== editor.current) return;
      if (event.key.toLowerCase() === 'z') { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      if (event.key.toLowerCase() === 'y') { event.preventDefault(); redo(); }
      if (event.key.toLowerCase() === 's') { event.preventDefault(); download(); }
    }
    window.addEventListener('keydown', keys);
    return () => window.removeEventListener('keydown', keys);
  });

  const preview = useMemo(() => {
    if (!source || (scope === 'selection' && !hasSelection)) return { text: '', detail: '', error: '' };
    try { return { ...runOperation(tool.id, source, options), error: '' }; }
    catch (error) { return { text: '', detail: '', error: error instanceof Error ? error.message : 'Confira as opções.' }; }
  }, [source, scope, hasSelection, tool.id, options]);
  function apply() {
    if (!source) return notify(scope === 'selection' ? 'Selecione um trecho no editor primeiro.' : 'Cole ou importe um texto primeiro.', 'error');
    if (preview.error) return notify(preview.error, 'error');
    const next = scope === 'selection' ? replaceRange(text, selection, preview.text) : preview.text;
    commit(next, tool.name, preview.detail);
  }
  const finder = useMemo(() => findMatches(text, query, regex, matchCase), [text, query, regex, matchCase]);
  function find(direction: number) {
    if (!finder.matches.length) return;
    const index = activeMatch < 0 ? (direction > 0 ? 0 : finder.matches.length - 1) : (activeMatch + direction + finder.matches.length) % finder.matches.length;
    const match = finder.matches[index]; setActiveMatch(index); editor.current?.focus(); editor.current?.setSelectionRange(match.start, match.end); setSelection(match);
    if (editor.current && !wrap) { editor.current.scrollTop = Math.max(0, text.slice(0, match.start).split('\n').length * 24 - editor.current.clientHeight / 2); setScrollTop(editor.current.scrollTop); }
  }
  function replace(all: boolean) {
    if (!finder.matches.length) return;
    const matches = all ? finder.matches : [finder.matches[activeMatch < 0 ? 0 : activeMatch]];
    const next = replaceLiteralMatches(text, matches, replacement);
    commit(next, all ? 'Substituir todas' : 'Substituir ocorrência', `${matches.length} correspondências substituídas`);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(text); notify('Texto copiado para a área de transferência.'); }
    catch { editor.current?.focus(); editor.current?.select(); notify('Use Ctrl+C para copiar o texto selecionado.', 'error'); }
  }
  function download() {
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'textutility.txt'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('Arquivo .txt preparado.');
  }
  async function importFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > 4_000_000) { notify('Arquivo muito grande. Limite: 4 MB.', 'error'); event.target.value = ''; return; }
    if (text && !window.confirm('Importar este arquivo substituirá o texto atual. A troca poderá ser desfeita. Continuar?')) { event.target.value = ''; return; }
    try { const contents = await selected.text(); commit(contents.replace(/\r\n?/g, '\n'), 'Importar arquivo', selected.name); }
    catch { notify('Não foi possível ler o arquivo. Tente um .txt em UTF-8.', 'error'); }
    event.target.value = '';
  }
  const stats = useMemo(() => ({ lines: countLines(text), words: (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? []).length, chars: Array.from(text).length }), [text]);
  const canUndo = cursor > 0 || (ready && snapshots[cursor]?.text !== text);
  const canRedo = cursor < snapshots.length - 1 && snapshots[cursor]?.text === text;
  const lines = lineWindow(stats.lines, scrollTop);
  const currentCategory = categories.find(item => item.id === category)!;
  const history = snapshots.slice(1).map((item, index) => ({ ...item, index: index + 1 })).slice(-MAX_HISTORY_EDITS).reverse();
  const previewSnippet = preview.text.length > 240 ? preview.text.slice(0, 240) + '\n…' : preview.text;

  return <div className={`app-shell ${expanded ? 'is-expanded' : ''}`}>
    <a className="skip-link" href="#main-editor">Ir para o editor</a>
    <header className="site-header">
      <a href="/" className="wordmark" aria-label="TextUtility início"><span className="logo-mark"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 6h14M5 12h9M5 18h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/></svg></span>TextUtility<span className="version">2.0</span></a>
      <div className="header-right"><a className="source-link" href={repositoryUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-label="Código aberto — endereço GitHub provisório" title="Endereço temporário: substitua pelo repositório real antes de publicar"><Code2 size={15}/><span>Código aberto</span><small>link provisório</small><ArrowUpRight size={13}/></a><span className="private-label"><LockKeyhole size={13}/>Processamento local</span><button className="help-button" onClick={() => setHelpOpen(!helpOpen)} aria-expanded={helpOpen}><Keyboard size={16}/><span>Atalhos</span></button></div>
    </header>
    {helpOpen && <section className="shortcuts" aria-label="Atalhos"><span><kbd>Ctrl F</kbd> Buscar texto</span><span><kbd>Ctrl K</kbd> Buscar ferramenta</span><span><kbd>Ctrl Z</kbd> Desfazer</span><span><kbd>Ctrl Shift Z</kbd> Refazer</span><span><kbd>Ctrl S</kbd> Baixar (no editor)</span><button aria-label="Fechar atalhos" onClick={() => setHelpOpen(false)}><X size={15}/></button></section>}
    <main className="main-content">
      <section className="workspace-intro"><div><p className="product-kicker">{tools.length} FERRAMENTAS <span>· EDIÇÃO EM LOTE</span></p><h1>Editor de texto em lote.</h1><p>Limpe, transforme e organize listas sem trocar de ferramenta.</p></div><button className="demo-button" title="Carrega conteúdo de demonstração; pedirá confirmação se o editor não estiver vazio" onClick={loadExample}>Carregar exemplo <ArrowUpRight size={15}/></button></section>
      <nav className="category-nav" aria-label="Categorias de ferramentas">
        <div className="category-tabs">{categories.map(({ id, name, icon: Icon }) => <button key={id} className={category === id ? 'category-tab active' : 'category-tab'} onClick={() => chooseCategory(id)} aria-pressed={category === id}><Icon size={16}/>{name}<span>{tools.filter(t => t.category === id).length}</span>{category === id && <motion.i layoutId="category-line" transition={{ duration: reduced ? 0 : .18 }}/>}</button>)}</div>
        <div className="tool-search-wrap"><Search size={15}/><input ref={toolSearch} id="tool-search" type="search" role="combobox" aria-label="Buscar ferramentas por tarefa" aria-autocomplete="list" aria-expanded={searchOpen && Boolean(toolQuery)} aria-controls={searchOpen && toolQuery ? "tool-search-results" : undefined} aria-activedescendant={searchOpen && searchResults.length ? 'tool-search-option-' + activeSearchIndex : undefined} placeholder="O que você quer fazer? Ex.: remover linhas que contêm…" value={toolQuery} onFocus={() => setSearchOpen(true)} onBlur={() => setTimeout(() => setSearchOpen(false),160)} onChange={event => { setToolQuery(event.target.value); setSearchOpen(true); setActiveSearchIndex(0); }} onKeyDown={event => { if(event.key==='ArrowDown' && searchResults.length){event.preventDefault();setActiveSearchIndex(index=>(index+1)%searchResults.length);} if(event.key==='ArrowUp' && searchResults.length){event.preventDefault();setActiveSearchIndex(index=>(index-1+searchResults.length)%searchResults.length);} if(event.key==='Enter' && searchOpen && searchResults.length){event.preventDefault();selectToolResult(searchResults[activeSearchIndex] ?? searchResults[0]);} if(event.key==='Escape'){setSearchOpen(false);setToolQuery('');} }}/>{toolQuery && <button type="button" className="search-clear" aria-label="Limpar busca" onMouseDown={event=>event.preventDefault()} onClick={()=>{setToolQuery('');setSearchOpen(true);toolSearch.current?.focus();}}><X size={13}/></button>}<kbd>Ctrl K</kbd>{searchOpen && toolQuery && <div id="tool-search-results" role={searchResults.length ? "listbox" : "status"} aria-label="Resultados da busca de ferramentas" className="tool-search-results">{searchResults.length ? searchResults.map((result,index)=><button type="button" role="option" aria-selected={activeSearchIndex===index} id={'tool-search-option-'+index} key={result.tool.id+'-'+(result.mode??'')} onMouseDown={event=>event.preventDefault()} onMouseEnter={()=>setActiveSearchIndex(index)} onClick={()=>selectToolResult(result)}><span className="search-result-icon">{result.tool.id==='filter'?<ListFilter size={14}/>:<Settings2 size={14}/>}</span><span className="search-result-copy"><strong>{result.label}</strong><small>{result.tool.description}</small></span><span className="search-result-category">{categories.find(item=>item.id===result.tool.category)?.name}</span></button>) : <p>Nenhuma ferramenta encontrada. Tente “linhas”, “ordenar” ou “limpar”.</p>}</div>}</div>
      </nav>
<div className="category-actions" role="group" aria-label={'Operações de ' + currentCategory.name}><span className="category-actions-label">Ações de {currentCategory.name}</span>{tools.filter(item=>item.category===category).flatMap(item=>item.id==='filter'?[{key:'filter-remove',item,label:'Remover linhas que contêm…',mode:'remove' as const},{key:'filter-keep',item,label:'Manter linhas que contêm…',mode:'keep' as const}]:[{key:item.id,item,label:item.name,mode:undefined as ('remove'|'keep'|undefined)}]).map(action=><button type="button" key={action.key} title={action.item.description} aria-pressed={toolId===action.item.id && (action.item.id!=='filter'||options.mode===action.mode)} className={toolId===action.item.id && (action.item.id!=='filter'||options.mode===action.mode)?'active':''} onClick={()=>chooseTool(action.item.id,action.mode)}>{action.item.id==='filter'?(action.mode==='remove'?<Trash2 size={13}/>:<ListFilter size={13}/>):<span className="action-dot" aria-hidden="true"/>}{action.label}</button>)}</div>
      <div className="workbench">
        <section className="document" aria-labelledby="document-title">
          <div className="document-top"><div className="document-name"><FileText size={17}/><h2 id="document-title">Editor de texto</h2><span className="draft-dot" title={saved}/></div><div className="document-tools"><button onClick={undo} disabled={!canUndo} title="Desfazer" aria-label="Desfazer"><Undo2 size={16}/></button><button onClick={redo} disabled={!canRedo} title="Refazer" aria-label="Refazer"><Redo2 size={16}/></button><span className="toolbar-divider"/><button onClick={() => { setFindOpen(!findOpen); if (!findOpen) setTimeout(() => search.current?.focus(), 0); }} className={findOpen ? 'selected' : ''} aria-label="Localizar e substituir" aria-expanded={findOpen}><Search size={16}/></button><button onClick={() => setWrap(!wrap)} className={wrap ? 'selected' : ''} title="Quebra visual de linhas" aria-label="Quebra visual de linhas" aria-pressed={wrap}><WrapText size={16}/></button><button onClick={() => setExpanded(!expanded)} title="Expandir editor" aria-label={expanded ? 'Restaurar editor' : 'Expandir editor'}>{expanded ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}</button></div></div>
          {findOpen && <div className="find-panel"><div className="find-row"><Search size={15}/><input ref={search} aria-label="Buscar no texto" placeholder="Buscar no texto…" value={query} onChange={e => { setQuery(e.target.value); setActiveMatch(-1); }} onKeyDown={e => { if (e.key === 'Enter') find(e.shiftKey ? -1 : 1); if (e.key === 'Escape') setFindOpen(false); }}/><span className="match-count">{activeMatch >= 0 && activeMatch < finder.matches.length ? `${activeMatch + 1}/` : ''}{finder.matches.length}</span><button aria-label="Correspondência anterior" disabled={!finder.matches.length} onClick={() => find(-1)}><ArrowUp size={14}/></button><button aria-label="Próxima correspondência" disabled={!finder.matches.length} onClick={() => find(1)}><ArrowDown size={14}/></button><button aria-label="Fechar busca" onClick={() => setFindOpen(false)}><X size={14}/></button></div><div className="find-options"><label><input type="checkbox" checked={matchCase} onChange={e => { setMatchCase(e.target.checked); setActiveMatch(-1); }}/>Diferenciar caixa</label><label><input type="checkbox" checked={regex} onChange={e => { setRegex(e.target.checked); setActiveMatch(-1); }}/>Expressão regular</label><button onClick={() => setReplaceOpen(!replaceOpen)} aria-expanded={replaceOpen}>Substituir <ChevronDown size={12}/></button></div>{replaceOpen && <div className="replace-row"><input aria-label="Texto substituto" placeholder="Texto literal (vazio para remover)" title="Substituição literal: grupos como $1 não são expandidos." value={replacement} onChange={e => setReplacement(e.target.value)}/><button disabled={!finder.matches.length} onClick={() => replace(false)}>Uma</button><button disabled={!finder.matches.length} onClick={() => replace(true)}>Todas</button></div>}{finder.error && <p className="field-error" role="alert">{finder.error}</p>}</div>}
          <div className="editor-surface">
            {!wrap && <pre className="line-gutter" aria-hidden="true"><span style={{ display: 'block', transform: `translateY(${lines.offset}px)` }}>{Array.from({ length: lines.count }, (_, i) => lines.first + i + 1).join('\n')}</span></pre>}
            <textarea ref={editor} id="main-editor" aria-label="Editor de texto" wrap={wrap ? 'soft' : 'off'} spellCheck={false} maxLength={MAX_TEXT} value={text} placeholder={'Cole seu texto aqui.\n\nUma lista, um rascunho, um CSV…\nDeixe o resto com as ferramentas ao lado.'} onChange={e => { setText(e.currentTarget.value); setSelection(clampRange({ start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd }, e.currentTarget.value.length)); setSnapshots(branchHistory(snapshots, cursor)); setActiveMatch(-1); }} onSelect={e => setSelection({ start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd })} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}/>
            {!text && <div className="empty-actions"><button onClick={() => file.current?.click()}><Import size={14}/>Importar arquivo</button><span>ou cole com <kbd>Ctrl V</kbd></span></div>}
          </div>
          <div className="document-stats"><span className="save-state" role="status" aria-live="polite" aria-atomic="true"><span/> {ready ? saved : 'Carregando rascunho…'}</span><div><span><b>{stats.lines.toLocaleString('pt-BR')}</b> linhas</span><span><b>{stats.words.toLocaleString('pt-BR')}</b> palavras</span><span><b>{stats.chars.toLocaleString('pt-BR')}</b> caracteres</span></div></div>
          <div className="document-bottom"><input ref={file} type="file" hidden accept=".txt,.csv,text/plain,text/csv" onChange={importFile}/><button className="secondary-button import-button" onClick={() => file.current?.click()}><Import size={15}/>Importar</button><button className="clear-document" disabled={!text} onClick={() => commit('', 'Limpar documento', 'Todo o conteúdo removido; pode ser desfeito')}><Trash2 size={14}/>Limpar</button><div className="export-actions"><button className="secondary-button" onClick={copy} disabled={!text}><Copy size={15}/>Copiar</button><button className="dark-button" onClick={download} disabled={!text}><Download size={15}/>Baixar .txt</button></div></div>
        </section>
        <aside className="tool-panel" aria-label="Configuração de ferramenta">
          <div className="tool-panel-top"><span className="panel-label"><currentCategory.icon size={14}/>{currentCategory.name}</span><p>{currentCategory.hint}</p></div>
          <div className="tool-picker"><label htmlFor="tool-select">Ferramenta</label><div className="select-container"><select id="tool-select" value={toolId} onChange={e => chooseTool(e.target.value)}>{tools.filter(item => item.category === category).map(item => <option key={item.id} value={item.id}>{item.id === 'filter' ? (options.mode === 'remove' ? 'Remover linhas que contêm…' : 'Manter linhas que contêm…') : item.name}</option>)}</select><ChevronDown size={16}/></div></div>
          <AnimatePresence mode="wait" initial={false}><motion.div key={tool.id} className="tool-content" initial={reduced ? { opacity: .8 } : { opacity: 0, transform: 'translateY(6px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} exit={{ opacity: 0 }} transition={{ duration: reduced ? .08 : .16, ease: [.16, 1, .3, 1] }}>
            <h3>{tool.id === 'filter' ? (options.mode === 'remove' ? 'Remover linhas que…' : 'Manter linhas que…') : tool.name}</h3><p className="tool-description">{tool.description}</p>
            <div className="tool-fields">{tool.fields.map(field => field.type === 'checkbox' ? <label className="checkbox-field" key={field.key}><input type="checkbox" checked={options[field.key] === 'true'} onChange={e => setOptions({ ...options, [field.key]: String(e.target.checked) })}/><span>{field.label}</span></label> : <label className="form-field" key={field.key}><span>{field.label}</span>{field.type === 'select' ? <div className="select-container"><select disabled={tool.id === 'filter' && field.key === 'matchType' && options.regex === 'true'} value={options[field.key] ?? ''} onChange={e => setOptions({ ...options, [field.key]: e.target.value })}>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={14}/></div> : field.type === 'textarea' ? <textarea value={options[field.key] ?? ''} placeholder={field.placeholder} onChange={e => setOptions({ ...options, [field.key]: e.target.value })}/> : <input type={field.type} value={options[field.key] ?? ''} placeholder={field.placeholder} onChange={e => setOptions({ ...options, [field.key]: e.target.value })}/>}</label>)}</div>
          </motion.div></AnimatePresence>
          <div className="scope-row"><span>Aplicar em</span><div className="segmented"><button aria-pressed={scope === 'all'} className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>Texto inteiro</button><button aria-pressed={scope === 'selection'} className={scope === 'selection' ? 'active' : ''} onClick={() => setScope('selection')}>Seleção</button></div></div>
          <div className="result-preview"><div className="preview-label"><span><ListFilter size={13}/>Prévia do resultado</span><span>{source && !preview.error ? `${countLines(preview.text)} linhas` : '—'}</span></div>{preview.error ? <p className="field-error" role="alert">{preview.error}</p> : source ? <><pre>{previewSnippet || '(texto vazio)'}</pre><p className="preview-detail">{preview.detail}</p></> : <p className="preview-empty">{scope === 'selection' ? 'Selecione um trecho para ver o resultado.' : 'Adicione um texto para ver o resultado antes de aplicar.'}</p>}</div>
          <button className="apply-button" onClick={apply} disabled={!source || !!preview.error}><Settings2 size={16}/>{tool.id === 'filter' ? (options.mode === 'remove' ? 'Remover linhas correspondentes' : 'Manter linhas correspondentes') : `Aplicar ao ${scope === 'selection' ? 'trecho' : 'texto'}`}<ArrowUpRight size={16}/></button><p className="reversible-note"><RotateCcw size={11}/>Até dez edições para desfazer e restaurar.</p>
        </aside>
      </div>
      <section className="history-strip" aria-labelledby="history-title">
        <div className="history-header"><h2 id="history-title"><History size={15}/>Histórico</h2><span>{history.length} / {MAX_HISTORY_EDITS} edições recentes</span></div>
        {!history.length ? <p className="history-empty">Cada aplicação cria uma versão restaurável. Acesse as dez últimas edições desta sessão; desfazer e refazer continuam disponíveis no editor.</p> : <div className="history-items">{history.map(item => <div key={item.serial} className={item.index > cursor ? 'history-item undone' : 'history-item'}><span className="history-icon">{item.index > cursor ? <Undo2 size={13}/> : <Check size={13}/>}</span><div className="history-entry-copy"><strong>{item.label}</strong><span>{item.detail}</span></div><span className="history-state">{item.index === cursor && item.text === text ? 'Atual' : item.index > cursor ? 'Depois da atual' : 'Anterior'}</span><button type="button" className="history-restore" disabled={item.index === cursor && item.text === text} aria-label={'Restaurar edição: ' + item.label} title={item.index === cursor && item.text === text ? 'Esta é a versão atual' : 'Restaurar esta versão'} onClick={() => restoreHistoryItem(item.index)}>{item.index === cursor && item.text === text ? 'Atual' : <><RotateCcw size={13}/>Restaurar</>}</button></div>)}</div>}
      </section>
      <footer className="workspace-footer"><span><LockKeyhole size={12}/>Seu texto não é enviado. Rascunho salvo apenas neste navegador.</span><span>Projeto preparado para código aberto.</span></footer>
    </main>
    <AnimatePresence>{notice && <motion.div className={`toast ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'} initial={{ opacity: 0, transform: reduced ? 'none' : 'translateY(8px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} exit={{ opacity: 0 }} transition={{ duration: .16, ease: [.16, 1, .3, 1] }}>{notice.kind === 'success' && <Check size={15}/>}<span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="Fechar aviso"><X size={14}/></button></motion.div>}</AnimatePresence>
  </div>;
}
