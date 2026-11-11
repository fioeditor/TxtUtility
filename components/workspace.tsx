'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowDown, ArrowUp, Check, ChevronDown, Copy, Download, FileText, History, Import, ListFilter, LockKeyhole, Maximize2, Minimize2, Moon, RotateCcw, Search, Eraser, Sun, Trash2, Undo2, Redo2, X, Settings2, ListOrdered, Layers, Keyboard, WrapText } from 'lucide-react';
import { tools, runOperation, type Tool } from '@/lib/operations';
import { clampRange, replaceRange, findMatches, replaceLiteralMatches, lineWindow, EDITOR_LINE_HEIGHT } from '@/lib/editor';
import { searchTools, type OperationResult } from '@/lib/discovery';
import { branchHistory, restoreHistory, MAX_HISTORY_EDITS, retainHistory } from '@/lib/history';
import { repositoryUrl } from '@/lib/project';

const KEY = 'textutility.draft.v1';
const THEME_KEY = 'textutility.theme';
const MAX_TEXT = 2_000_000;
const EXAMPLE_LABEL = 'Load example';
const categories = [
  { id: 'clean', name: 'Clean', icon: Eraser, hint: 'Spaces, duplicates and characters.' },
  { id: 'transform', name: 'Transform', icon: Settings2, hint: 'Case, affixes and numbering.' },
  { id: 'lines', name: 'Lines', icon: ListOrdered, hint: 'Sorting, filters and delimiters.' },
  { id: 'lists', name: 'Lists', icon: Layers, hint: 'Comparison, merging and sampling.' },
] as const;
const demo = '  Aurora Cafe  \nNorth Studio\nAurora Cafe\n\nCentral Library\n  Green Market\nNorth Studio\nHorizon Atelier\n';
type Snapshot = { text: string; label: string; detail: string; serial: number };
type Notice = { text: string; kind: 'success' | 'error' } | null;
const defaults = (tool: Tool) => Object.fromEntries(tool.fields.map(field => [field.key, field.defaultValue]));
const countLines = (text: string) => text.length ? text.split('\n').length : 0;

// lucide-react has no brand icons, so the GitHub mark is inlined.
const GithubIcon = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;

export default function Workspace() {
  const reduced = useReducedMotion();
  const [text, setText] = useState('');
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState('Local draft');
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
  const [theme, setTheme] = useState<'light' | 'dark' | null>(null);
  const source = scope === 'selection' ? text.slice(selection.start, selection.end) : text;
  const hasSelection = selection.end > selection.start;

  useEffect(() => {
    const stored = document.documentElement.dataset.theme;
    setTheme(stored === 'dark' ? 'dark' : 'light');
  }, []);
  function applyTheme(next: 'light' | 'dark') {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem(THEME_KEY, next); } catch { /* theme stays for this view */ }
  }
  useEffect(() => {
    let draft = '';
    try { draft = localStorage.getItem(KEY)?.slice(0, MAX_TEXT) ?? ''; } catch { setSaved('Saving unavailable'); }
    setText(draft);
    setSnapshots([{ text: draft, label: 'Session start', detail: 'Draft restored', serial: 0 }]);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    setSaved('Saving…');
    const timer = setTimeout(() => {
      try { localStorage.setItem(KEY, text); setSaved('Saved in this browser'); }
      catch { setSaved('This session only'); }
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
      const next = retainHistory(branchHistory(snapshots, cursor).concat({ text, label: 'Manual edit', detail: String(Array.from(text).length) + ' characters', serial: ++serial.current }));
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
    if (next.length > MAX_TEXT) return notify('The result exceeds the 2 million character limit.', 'error');
    if (next === text) return notify('The text is already in that format. Nothing changed.');
    let base = branchHistory(snapshots, cursor);
    if (!base.length || base.at(-1)?.text !== text) base.push({ text, label: 'Manual edit', detail: `${text.length} characters`, serial: ++serial.current });
    base.push({ text: next, label, detail, serial: ++serial.current });
    base = retainHistory(base);
    setSnapshots(base); setCursor(base.length - 1); setText(next); setSelection({ start: 0, end: 0 }); setActiveMatch(-1);
    notify(label);
  }
  function restoreHistoryItem(index: number) {
    if (index === cursor && snapshots[cursor]?.text === text) return;
    const pending = snapshots[cursor]?.text !== text
      ? { text, label: 'Manual edit', detail: 'Text updated', serial: ++serial.current }
      : undefined;
    const restored = restoreHistory(snapshots, cursor, index, pending);
    if (!restored) return;
    setSnapshots(restored.states); setText(restored.state.text); setCursor(restored.cursor);
    setSelection({ start: 0, end: 0 }); setActiveMatch(-1);
    notify('Version restored: ' + restored.state.label);
  }
  function loadExample() {
    if (text && !window.confirm('Loading the example will replace the current text. You can undo this. Continue?')) return;
    commit(demo, EXAMPLE_LABEL, 'Sample list to try things out');
  }
  function undo() {
    if (snapshots[cursor]?.text !== text) {
      const next = retainHistory(branchHistory(snapshots, cursor).concat({ text, label: 'Manual edit', detail: 'Text updated', serial: ++serial.current }));
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
    catch (error) { return { text: '', detail: '', error: error instanceof Error ? error.message : 'Check the options.' }; }
  }, [source, scope, hasSelection, tool.id, options]);
  function apply() {
    if (!source) return notify(scope === 'selection' ? 'Select a passage in the editor first.' : 'Paste or import some text first.', 'error');
    if (preview.error) return notify(preview.error, 'error');
    const next = scope === 'selection' ? replaceRange(text, selection, preview.text) : preview.text;
    commit(next, tool.name, preview.detail);
  }
  const finder = useMemo(() => findMatches(text, query, regex, matchCase), [text, query, regex, matchCase]);
  function find(direction: number) {
    if (!finder.matches.length) return;
    const index = activeMatch < 0 ? (direction > 0 ? 0 : finder.matches.length - 1) : (activeMatch + direction + finder.matches.length) % finder.matches.length;
    const match = finder.matches[index]; setActiveMatch(index); editor.current?.focus(); editor.current?.setSelectionRange(match.start, match.end); setSelection(match);
    if (editor.current && !wrap) { editor.current.scrollTop = Math.max(0, text.slice(0, match.start).split('\n').length * EDITOR_LINE_HEIGHT - editor.current.clientHeight / 2); setScrollTop(editor.current.scrollTop); }
  }
  function replace(all: boolean) {
    if (!finder.matches.length) return;
    const matches = all ? finder.matches : [finder.matches[activeMatch < 0 ? 0 : activeMatch]];
    const next = replaceLiteralMatches(text, matches, replacement);
    commit(next, all ? 'Replace all' : 'Replace occurrence', `${matches.length} matches replaced`);
  }
  async function copy() {
    try { await navigator.clipboard.writeText(text); notify('Text copied to the clipboard.'); }
    catch { editor.current?.focus(); editor.current?.select(); notify('Use Ctrl+C to copy the selected text.', 'error'); }
  }
  function download() {
    if (!text) return;
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'textutility.txt'; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); notify('.txt file ready.');
  }
  async function importFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > 4_000_000) { notify('File too large. Limit: 4 MB.', 'error'); event.target.value = ''; return; }
    if (text && !window.confirm('Importing this file will replace the current text. You can undo this. Continue?')) { event.target.value = ''; return; }
    try { const contents = await selected.text(); commit(contents.replace(/\r\n?/g, '\n'), 'Import file', selected.name); }
    catch { notify('Could not read the file. Try a UTF-8 .txt file.', 'error'); }
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
    <a className="skip-link" href="#main-editor">Skip to editor</a>
    <header className="site-header">
      <div className="brand">
        <a href="/" className="wordmark" aria-label="TextUtility home"><span className="logo-mark"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 6h14M5 12h9M5 18h12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/></svg></span>TextUtility</a>
        <a className="oss-badge" href={repositoryUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer"><span className="oss-dot" aria-hidden="true"/>Open source</a>
      </div>
      <div className="header-right">
        <div className="theme-switch" role="group" aria-label="Color mode">
          <button type="button" aria-pressed={theme === 'light'} aria-label="Light mode" onClick={() => applyTheme('light')}><Sun size={16} aria-hidden="true"/><span>Light</span></button>
          <button type="button" aria-pressed={theme === 'dark'} aria-label="Night mode" onClick={() => applyTheme('dark')}><Moon size={16} aria-hidden="true"/><span>Night</span></button>
        </div>
        <a className="source-link" href={repositoryUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" aria-label="TextUtility on GitHub"><GithubIcon/><span>GitHub</span></a>
        <button className="help-button" onClick={() => setHelpOpen(!helpOpen)} aria-expanded={helpOpen}><Keyboard size={16}/><span>Shortcuts</span></button>
      </div>
    </header>
    {helpOpen && <section className="shortcuts" aria-label="Shortcuts"><span><kbd>Ctrl F</kbd> Find in text</span><span><kbd>Ctrl K</kbd> Find a tool</span><span><kbd>Ctrl Z</kbd> Undo</span><span><kbd>Ctrl Shift Z</kbd> Redo</span><span><kbd>Ctrl S</kbd> Download (in editor)</span><button aria-label="Close shortcuts" onClick={() => setHelpOpen(false)}><X size={15}/></button></section>}
    <main className="main-content">
      <nav className="category-nav" aria-label="Tool categories">
        <div className="category-tabs">{categories.map(({ id, name, icon: Icon }) => <button key={id} className={category === id ? 'category-tab active' : 'category-tab'} onClick={() => chooseCategory(id)} aria-pressed={category === id}><Icon size={16}/>{name}<span>{tools.filter(t => t.category === id).length}</span>{category === id && <motion.i layoutId="category-line" transition={{ duration: reduced ? 0 : .18 }}/>}</button>)}</div>
        <div className="tool-search-wrap"><Search size={15}/><input ref={toolSearch} id="tool-search" type="search" role="combobox" aria-label="Search tools by task" aria-autocomplete="list" aria-expanded={searchOpen && Boolean(toolQuery)} aria-controls={searchOpen && toolQuery ? "tool-search-results" : undefined} aria-activedescendant={searchOpen && searchResults.length ? 'tool-search-option-' + activeSearchIndex : undefined} placeholder="What do you want to do? e.g. remove lines containing…" value={toolQuery} onFocus={() => setSearchOpen(true)} onBlur={() => setTimeout(() => setSearchOpen(false),160)} onChange={event => { setToolQuery(event.target.value); setSearchOpen(true); setActiveSearchIndex(0); }} onKeyDown={event => { if(event.key==='ArrowDown' && searchResults.length){event.preventDefault();setActiveSearchIndex(index=>(index+1)%searchResults.length);} if(event.key==='ArrowUp' && searchResults.length){event.preventDefault();setActiveSearchIndex(index=>(index-1+searchResults.length)%searchResults.length);} if(event.key==='Enter' && searchOpen && searchResults.length){event.preventDefault();selectToolResult(searchResults[activeSearchIndex] ?? searchResults[0]);} if(event.key==='Escape'){setSearchOpen(false);setToolQuery('');} }}/>{toolQuery && <button type="button" className="search-clear" aria-label="Clear search" onMouseDown={event=>event.preventDefault()} onClick={()=>{setToolQuery('');setSearchOpen(true);toolSearch.current?.focus();}}><X size={13}/></button>}<kbd>Ctrl K</kbd>{searchOpen && toolQuery && <div id="tool-search-results" role={searchResults.length ? "listbox" : "status"} aria-label="Tool search results" className="tool-search-results">{searchResults.length ? searchResults.map((result,index)=><button type="button" role="option" aria-selected={activeSearchIndex===index} id={'tool-search-option-'+index} key={result.tool.id+'-'+(result.mode??'')} onMouseDown={event=>event.preventDefault()} onMouseEnter={()=>setActiveSearchIndex(index)} onClick={()=>selectToolResult(result)}><span className="search-result-icon">{result.tool.id==='filter'?<ListFilter size={14}/>:<Settings2 size={14}/>}</span><span className="search-result-copy"><strong>{result.label}</strong><small>{result.tool.description}</small></span><span className="search-result-category">{categories.find(item=>item.id===result.tool.category)?.name}</span></button>) : <p>No tools found. Try “lines”, “sort” or “clean”.</p>}</div>}</div>
      </nav>
<div className="category-actions" role="group" aria-label={currentCategory.name + ' actions'}><span className="category-actions-label">{currentCategory.name} actions</span>{tools.filter(item=>item.category===category).flatMap(item=>item.id==='filter'?[{key:'filter-remove',item,label:'Remove lines containing…',mode:'remove' as const},{key:'filter-keep',item,label:'Keep lines containing…',mode:'keep' as const}]:[{key:item.id,item,label:item.name,mode:undefined as ('remove'|'keep'|undefined)}]).map(action=><button type="button" key={action.key} title={action.item.description} aria-pressed={toolId===action.item.id && (action.item.id!=='filter'||options.mode===action.mode)} className={toolId===action.item.id && (action.item.id!=='filter'||options.mode===action.mode)?'active':''} onClick={()=>chooseTool(action.item.id,action.mode)}>{action.item.id==='filter'?(action.mode==='remove'?<Trash2 size={13}/>:<ListFilter size={13}/>):<span className="action-dot" aria-hidden="true"/>}{action.label}</button>)}</div>
      <div className="workbench">
        <section className="document" aria-labelledby="document-title">
          <div className="document-top"><div className="document-name"><FileText size={17}/><h2 id="document-title">Text editor</h2><span className="draft-dot" title={saved}/></div><div className="document-tools"><button onClick={undo} disabled={!canUndo} title="Undo" aria-label="Undo"><Undo2 size={16}/></button><button onClick={redo} disabled={!canRedo} title="Redo" aria-label="Redo"><Redo2 size={16}/></button><span className="toolbar-divider"/><button onClick={() => { setFindOpen(!findOpen); if (!findOpen) setTimeout(() => search.current?.focus(), 0); }} className={findOpen ? 'selected' : ''} aria-label="Find and replace" aria-expanded={findOpen}><Search size={16}/></button><button onClick={() => setWrap(!wrap)} className={wrap ? 'selected' : ''} title="Soft line wrap" aria-label="Soft line wrap" aria-pressed={wrap}><WrapText size={16}/></button><button onClick={() => setExpanded(!expanded)} title="Expand editor" aria-label={expanded ? 'Restore editor' : 'Expand editor'}>{expanded ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}</button></div></div>
          {findOpen && <div className="find-panel"><div className="find-row"><Search size={15}/><input ref={search} aria-label="Search in text" placeholder="Search in text…" value={query} onChange={e => { setQuery(e.target.value); setActiveMatch(-1); }} onKeyDown={e => { if (e.key === 'Enter') find(e.shiftKey ? -1 : 1); if (e.key === 'Escape') setFindOpen(false); }}/><span className="match-count">{activeMatch >= 0 && activeMatch < finder.matches.length ? `${activeMatch + 1}/` : ''}{finder.matches.length}</span><button aria-label="Previous match" disabled={!finder.matches.length} onClick={() => find(-1)}><ArrowUp size={14}/></button><button aria-label="Next match" disabled={!finder.matches.length} onClick={() => find(1)}><ArrowDown size={14}/></button><button aria-label="Close search" onClick={() => setFindOpen(false)}><X size={14}/></button></div><div className="find-options"><label><input type="checkbox" checked={matchCase} onChange={e => { setMatchCase(e.target.checked); setActiveMatch(-1); }}/>Match case</label><label><input type="checkbox" checked={regex} onChange={e => { setRegex(e.target.checked); setActiveMatch(-1); }}/>Regular expression</label><button onClick={() => setReplaceOpen(!replaceOpen)} aria-expanded={replaceOpen}>Replace <ChevronDown size={12}/></button></div>{replaceOpen && <div className="replace-row"><input aria-label="Replacement text" placeholder="Literal text (empty to delete)" title="Literal replacement: groups like $1 are not expanded." value={replacement} onChange={e => setReplacement(e.target.value)}/><button disabled={!finder.matches.length} onClick={() => replace(false)}>One</button><button disabled={!finder.matches.length} onClick={() => replace(true)}>All</button></div>}{finder.error && <p className="field-error" role="alert">{finder.error}</p>}</div>}
          <div className="editor-surface">
            {!wrap && <pre className="line-gutter" aria-hidden="true"><span style={{ display: 'block', transform: `translateY(${lines.offset}px)` }}>{Array.from({ length: lines.count }, (_, i) => lines.first + i + 1).join('\n')}</span></pre>}
            <textarea ref={editor} id="main-editor" aria-label="Text editor" wrap={wrap ? 'soft' : 'off'} spellCheck={false} maxLength={MAX_TEXT} value={text} placeholder={'Paste your text here.\n\nA list, a draft, a CSV…\nLeave the rest to the tools on the side.'} onChange={e => { setText(e.currentTarget.value); setSelection(clampRange({ start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd }, e.currentTarget.value.length)); setSnapshots(branchHistory(snapshots, cursor)); setActiveMatch(-1); }} onSelect={e => setSelection({ start: e.currentTarget.selectionStart, end: e.currentTarget.selectionEnd })} onScroll={e => setScrollTop(e.currentTarget.scrollTop)}/>
            {!text && <div className="empty-actions"><button onClick={() => file.current?.click()}><Import size={14}/>Import file</button><button onClick={loadExample} title="Loads sample content">Load example</button><span>or paste with <kbd>Ctrl V</kbd></span></div>}
          </div>
          <div className="document-stats"><span className="save-state" role="status" aria-live="polite" aria-atomic="true"><span/> {ready ? saved : 'Loading draft…'}</span><div><span><b>{stats.lines.toLocaleString('en-US')}</b> lines</span><span><b>{stats.words.toLocaleString('en-US')}</b> words</span><span><b>{stats.chars.toLocaleString('en-US')}</b> characters</span></div></div>
          <div className="document-bottom"><input ref={file} type="file" hidden accept=".txt,.csv,text/plain,text/csv" onChange={importFile}/><button className="secondary-button import-button" onClick={() => file.current?.click()}><Import size={15}/>Import</button><button className="clear-document" disabled={!text} onClick={() => commit('', 'Clear document', 'All content removed; can be undone')}><Trash2 size={14}/>Clear</button><div className="export-actions"><button className="secondary-button" onClick={copy} disabled={!text}><Copy size={15}/>Copy</button><button className="dark-button" onClick={download} disabled={!text}><Download size={15}/>Download .txt</button></div></div>
        </section>
        <aside className="tool-panel" aria-label="Tool settings">
          <div className="tool-panel-top"><span className="panel-label"><currentCategory.icon size={14}/>{currentCategory.name}</span><p>{currentCategory.hint}</p></div>
          <div className="tool-picker"><label htmlFor="tool-select">Tool</label><div className="select-container"><select id="tool-select" value={toolId} onChange={e => chooseTool(e.target.value)}>{tools.filter(item => item.category === category).map(item => <option key={item.id} value={item.id}>{item.id === 'filter' ? (options.mode === 'remove' ? 'Remove lines containing…' : 'Keep lines containing…') : item.name}</option>)}</select><ChevronDown size={16}/></div></div>
          <AnimatePresence mode="wait" initial={false}><motion.div key={tool.id} className="tool-content" initial={reduced ? { opacity: .8 } : { opacity: 0, transform: 'translateY(6px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} exit={{ opacity: 0 }} transition={{ duration: reduced ? .08 : .16, ease: [.16, 1, .3, 1] }}>
            <h3>{tool.id === 'filter' ? (options.mode === 'remove' ? 'Remove lines that…' : 'Keep lines that…') : tool.name}</h3><p className="tool-description">{tool.description}</p>
            <div className="tool-fields">{tool.fields.map(field => field.type === 'checkbox' ? <label className="checkbox-field" key={field.key}><input type="checkbox" checked={options[field.key] === 'true'} onChange={e => setOptions({ ...options, [field.key]: String(e.target.checked) })}/><span>{field.label}</span></label> : <label className="form-field" key={field.key}><span>{field.label}</span>{field.type === 'select' ? <div className="select-container"><select disabled={tool.id === 'filter' && field.key === 'matchType' && options.regex === 'true'} value={options[field.key] ?? ''} onChange={e => setOptions({ ...options, [field.key]: e.target.value })}>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={14}/></div> : field.type === 'textarea' ? <textarea value={options[field.key] ?? ''} placeholder={field.placeholder} onChange={e => setOptions({ ...options, [field.key]: e.target.value })}/> : <input type={field.type} value={options[field.key] ?? ''} placeholder={field.placeholder} onChange={e => setOptions({ ...options, [field.key]: e.target.value })}/>}</label>)}</div>
          </motion.div></AnimatePresence>
          <div className="scope-row"><span>Apply to</span><div className="segmented"><button aria-pressed={scope === 'all'} className={scope === 'all' ? 'active' : ''} onClick={() => setScope('all')}>Whole text</button><button aria-pressed={scope === 'selection'} className={scope === 'selection' ? 'active' : ''} onClick={() => setScope('selection')}>Selection</button></div></div>
          <div className="result-preview"><div className="preview-label"><span><ListFilter size={13}/>Result preview</span><span>{source && !preview.error ? `${countLines(preview.text)} lines` : '—'}</span></div>{preview.error ? <p className="field-error" role="alert">{preview.error}</p> : source ? <><pre>{previewSnippet || '(empty text)'}</pre><p className="preview-detail">{preview.detail}</p></> : <p className="preview-empty">{scope === 'selection' ? 'Select a passage to see the result.' : 'Add some text to see the result before applying.'}</p>}</div>
          <button className="apply-button" onClick={apply} disabled={!source || !!preview.error}><Settings2 size={16}/>{tool.id === 'filter' ? (options.mode === 'remove' ? 'Remove matching lines' : 'Keep matching lines') : `Apply to ${scope === 'selection' ? 'selection' : 'text'}`}</button><p className="reversible-note"><RotateCcw size={11}/>Up to ten edits to undo and restore.</p>
        </aside>
      </div>
      <section className="history-strip" aria-labelledby="history-title">
        <div className="history-header"><h2 id="history-title"><History size={15}/>History</h2><span>{history.length} / {MAX_HISTORY_EDITS} recent edits</span></div>
        {!history.length ? <p className="history-empty">Every applied operation creates a restorable version. The last ten edits of this session are available here; undo and redo remain available in the editor.</p> : <div className="history-items">{history.map(item => <div key={item.serial} className={item.index > cursor ? 'history-item undone' : 'history-item'}><span className="history-icon">{item.index > cursor ? <Undo2 size={13}/> : <Check size={13}/>}</span><div className="history-entry-copy"><strong>{item.label}</strong><span>{item.detail}</span></div><span className="history-state">{item.index === cursor && item.text === text ? 'Current' : item.index > cursor ? 'After current' : 'Previous'}</span><button type="button" className="history-restore" disabled={item.index === cursor && item.text === text} aria-label={'Restore edit: ' + item.label} title={item.index === cursor && item.text === text ? 'This is the current version' : 'Restore this version'} onClick={() => restoreHistoryItem(item.index)}>{item.index === cursor && item.text === text ? 'Current' : <><RotateCcw size={13}/>Restore</>}</button></div>)}</div>}
      </section>
      <footer className="workspace-footer"><span><LockKeyhole size={12}/>Your text never leaves your browser. The draft is saved only in this browser.</span></footer>
    </main>
    <AnimatePresence>{notice && <motion.div className={`toast ${notice.kind}`} role={notice.kind === 'error' ? 'alert' : 'status'} initial={{ opacity: 0, transform: reduced ? 'none' : 'translateY(8px)' }} animate={{ opacity: 1, transform: 'translateY(0px)' }} exit={{ opacity: 0 }} transition={{ duration: .16, ease: [.16, 1, .3, 1] }}>{notice.kind === 'success' && <Check size={15}/>}<span>{notice.text}</span><button onClick={() => setNotice(null)} aria-label="Close notice"><X size={14}/></button></motion.div>}</AnimatePresence>
  </div>;
}
