import React, { useCallback, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { JsonTreeView } from '../src/JsonTreeView'
import '../src/styles/styles.css'
import type { JsonTreeViewRef, JsonValue, SearchMatch } from '../src/types'
import './playground.css'

const sampleData: JsonValue = {
    name: 'John',
    age: 30,
    address: {
        city: 'New York',
        zip: '10001',
    },
    hobbies: ['reading', 'coding'],
    emptyArr: [],
    flags: { isActive: true, isBeta: false, isNull: null },
}

type Theme = 'light' | 'dark' | 'auto'
type DataPreset = 'sample' | 'deep' | 'wide' | 'big'

function buildDeepData(depth: number): JsonValue {
    let node: JsonValue = {
        leaf: 'needle in a haystack',
        ok: true,
        n: 42,
        nil: null,
    }
    for (let i = depth; i >= 1; i--) {
        node = { [`level_${i}`]: node, tag: i % 3 === 0 ? 'needle' : 'misc' } as JsonValue
    }
    return node
}

function buildWideData(width: number): JsonValue {
    const out: Record<string, JsonValue> = { meta: { width } }
    for (let i = 0; i < width; i++) {
        out[`key_${String(i).padStart(3, '0')}`] = i % 7 === 0 ? 'needle' : `value_${i}`
    }
    out.nested = {
        a: { b: { c: 'needle' } },
        flags: { t: true, f: false, n: null },
    }
    return out
}

function buildBigData(groups: number, itemsPerGroup: number): JsonValue {
    const out: Record<string, JsonValue> = { generated: true, groups }
    for (let g = 0; g < groups; g++) {
        const group: Record<string, JsonValue> = {
            id: g,
            label: g % 5 === 0 ? 'needle' : 'group',
        }
        const items: JsonValue[] = []
        for (let i = 0; i < itemsPerGroup; i++) {
            items.push({
                id: `${g}-${i}`,
                name: i % 17 === 0 ? 'needle item' : `item_${i}`,
                enabled: i % 2 === 0,
                score: (g + 1) * (i + 1),
            } satisfies JsonValue)
        }
        group.items = items
        out[`group_${g}`] = group
    }
    return out
}

function formatPathInput(raw: string): string[] {
    const s = raw.trim()
    if (!s) return []
    return s
        .split('.')
        .map((p) => p.trim())
        .filter(Boolean)
}

type LogItem = { id: string; ts: number; kind: 'info' | 'event' | 'warn'; message: string }
function nowId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function App() {
    const treeRef = useRef<JsonTreeViewRef>(null)

    const [preset, setPreset] = useState<DataPreset>('deep')
    const [theme, setTheme] = useState<Theme>('auto')
    const [defaultExpanded, setDefaultExpanded] = useState(true)
    const [searchable, setSearchable] = useState(true)
    const [showBreadcrumb, setShowBreadcrumb] = useState(true)
    const [indentSize, setIndentSize] = useState(18)
    const [fontSize, setFontSize] = useState(13)
    const [viewerHeight, setViewerHeight] = useState(520)

    const [useExternalQuery, setUseExternalQuery] = useState(false)
    const [externalQuery, setExternalQuery] = useState('needle')

    const [deepDepth, setDeepDepth] = useState(26)
    const [wideWidth, setWideWidth] = useState(120)
    const [bigGroups, setBigGroups] = useState(15)
    const [bigItemsPerGroup, setBigItemsPerGroup] = useState(25)

    const [jumpPathRaw, setJumpPathRaw] = useState('address.city')

    const [log, setLog] = useState<LogItem[]>(() => [
        {
            id: nowId(),
            ts: Date.now(),
            kind: 'info',
            message:
                'Playground ready. Try searching for "needle", press Enter / Shift+Enter, and use the ref buttons.',
        },
    ])

    const pushLog = useCallback((kind: LogItem['kind'], message: string) => {
        setLog((prev) => [{ id: nowId(), ts: Date.now(), kind, message }, ...prev].slice(0, 200))
    }, [])

    const handleNodeClick = useCallback(
        (path: string[], value: JsonValue) => {
            pushLog('event', `onNodeClick: ${path.join('.')} = ${safePreview(value)}`)
        },
        [pushLog]
    )

    const handleSearchChange = useCallback(
        (q: string, matches: SearchMatch[]) => {
            pushLog('info', `onSearchChange: "${q}" (${matches.length} matches)`)
        },
        [pushLog]
    )

    const data: JsonValue = useMemo(() => {
        if (preset === 'sample') return sampleData
        if (preset === 'deep') return buildDeepData(deepDepth)
        if (preset === 'wide') return buildWideData(wideWidth)
        return buildBigData(bigGroups, bigItemsPerGroup)
    }, [preset, deepDepth, wideWidth, bigGroups, bigItemsPerGroup])

    const effectiveSearchable = searchable

    return (
        <div className="pg">
            <header className="pg-header">
                <div className="pg-brand">
                    <div className="pg-title">React JSON TreeView</div>
                    <div className="pg-subtitle">Playground</div>
                </div>
                <div className="pg-header-actions">
                    <button
                        type="button"
                        className="pg-btn"
                        onClick={() => {
                            treeRef.current?.focusSearch()
                            pushLog('event', 'ref.focusSearch()')
                        }}
                    >
                        Focus Search
                    </button>
                    <button
                        type="button"
                        className="pg-btn"
                        onClick={() => {
                            treeRef.current?.expandAll()
                            pushLog('event', 'ref.expandAll()')
                        }}
                    >
                        Expand All
                    </button>
                    <button
                        type="button"
                        className="pg-btn"
                        onClick={() => {
                            treeRef.current?.collapseAll()
                            pushLog('event', 'ref.collapseAll()')
                        }}
                    >
                        Collapse All
                    </button>
                </div>
            </header>

            <div className="pg-grid">
                <aside className="pg-panel pg-controls">
                    <div className="pg-panel-title">Controls</div>
                    <div className="pg-controls-body">
                        <div className="pg-field">
                            <label className="pg-label" htmlFor="preset">
                                Data preset
                            </label>
                            <select
                                id="preset"
                                className="pg-select"
                                value={preset}
                                onChange={(e) => setPreset(e.target.value as DataPreset)}
                            >
                                <option value="sample">Sample</option>
                                <option value="deep">Deep nesting</option>
                                <option value="wide">Wide object</option>
                                <option value="big">Big dataset</option>
                            </select>
                        </div>

                        {preset === 'deep' && (
                            <div className="pg-field">
                                <label className="pg-label" htmlFor="deepDepth">
                                    Depth ({deepDepth})
                                </label>
                                <input
                                    id="deepDepth"
                                    className="pg-range"
                                    type="range"
                                    min={6}
                                    max={60}
                                    step={1}
                                    value={deepDepth}
                                    onChange={(e) => setDeepDepth(Number(e.target.value))}
                                />
                            </div>
                        )}

                        {preset === 'wide' && (
                            <div className="pg-field">
                                <label className="pg-label" htmlFor="wideWidth">
                                    Width ({wideWidth})
                                </label>
                                <input
                                    id="wideWidth"
                                    className="pg-range"
                                    type="range"
                                    min={20}
                                    max={600}
                                    step={10}
                                    value={wideWidth}
                                    onChange={(e) => setWideWidth(Number(e.target.value))}
                                />
                            </div>
                        )}

                        {preset === 'big' && (
                            <>
                                <div className="pg-field">
                                    <label className="pg-label" htmlFor="bigGroups">
                                        Groups ({bigGroups})
                                    </label>
                                    <input
                                        id="bigGroups"
                                        className="pg-range"
                                        type="range"
                                        min={3}
                                        max={50}
                                        step={1}
                                        value={bigGroups}
                                        onChange={(e) => setBigGroups(Number(e.target.value))}
                                    />
                                </div>
                                <div className="pg-field">
                                    <label className="pg-label" htmlFor="bigItems">
                                        Items / group ({bigItemsPerGroup})
                                    </label>
                                    <input
                                        id="bigItems"
                                        className="pg-range"
                                        type="range"
                                        min={5}
                                        max={60}
                                        step={1}
                                        value={bigItemsPerGroup}
                                        onChange={(e) =>
                                            setBigItemsPerGroup(Number(e.target.value))
                                        }
                                    />
                                </div>
                            </>
                        )}

                        <div className="pg-split" />

                        <div className="pg-field">
                            <label className="pg-label" htmlFor="theme">
                                Theme
                            </label>
                            <select
                                id="theme"
                                className="pg-select"
                                value={theme}
                                onChange={(e) => setTheme(e.target.value as Theme)}
                            >
                                <option value="auto">Auto</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>

                        <div className="pg-checkrow">
                            <label className="pg-check">
                                <input
                                    type="checkbox"
                                    checked={defaultExpanded}
                                    onChange={(e) => setDefaultExpanded(e.target.checked)}
                                />
                                defaultExpanded
                            </label>
                            <label className="pg-check">
                                <input
                                    type="checkbox"
                                    checked={searchable}
                                    onChange={(e) => setSearchable(e.target.checked)}
                                    disabled={useExternalQuery}
                                />
                                searchable
                            </label>
                            <label className="pg-check">
                                <input
                                    type="checkbox"
                                    checked={showBreadcrumb}
                                    onChange={(e) => setShowBreadcrumb(e.target.checked)}
                                />
                                showBreadcrumb
                            </label>
                        </div>

                        <div className="pg-field">
                            <label className="pg-label" htmlFor="indentSize">
                                indentSize ({indentSize})
                            </label>
                            <input
                                id="indentSize"
                                className="pg-range"
                                type="range"
                                min={10}
                                max={36}
                                step={1}
                                value={indentSize}
                                onChange={(e) => setIndentSize(Number(e.target.value))}
                            />
                        </div>

                        <div className="pg-field">
                            <label className="pg-label" htmlFor="fontSize">
                                fontSize ({fontSize})
                            </label>
                            <input
                                id="fontSize"
                                className="pg-range"
                                type="range"
                                min={11}
                                max={18}
                                step={1}
                                value={fontSize}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                            />
                        </div>

                        <div className="pg-field">
                            <label className="pg-label" htmlFor="viewerHeight">
                                viewerHeight ({viewerHeight}px)
                            </label>
                            <input
                                id="viewerHeight"
                                className="pg-range"
                                type="range"
                                min={240}
                                max={900}
                                step={10}
                                value={viewerHeight}
                                onChange={(e) => setViewerHeight(Number(e.target.value))}
                            />
                        </div>

                        <div className="pg-split" />

                        <div className="pg-field">
                            <label className="pg-check">
                                <input
                                    type="checkbox"
                                    checked={useExternalQuery}
                                    onChange={(e) => setUseExternalQuery(e.target.checked)}
                                />
                                externalSearchQuery (controlled)
                            </label>
                            <input
                                className="pg-input"
                                value={externalQuery}
                                onChange={(e) => setExternalQuery(e.target.value)}
                                placeholder='Try "needle", "true", "null"...'
                                disabled={!useExternalQuery}
                                onKeyDown={(e) => {
                                    if (!useExternalQuery) return
                                    if (e.key === 'Enter') {
                                        e.preventDefault()
                                        if (e.shiftKey) {
                                            treeRef.current?.previousMatch()
                                            pushLog('event', 'ref.previousMatch()')
                                        } else {
                                            treeRef.current?.nextMatch()
                                            pushLog('event', 'ref.nextMatch()')
                                        }
                                    } else if (e.key === 'Escape') {
                                        e.preventDefault()
                                        setExternalQuery('')
                                        pushLog('event', 'externalQuery cleared')
                                    }
                                }}
                            />
                            <div className="pg-row">
                                <button
                                    type="button"
                                    className="pg-btn"
                                    onClick={() => {
                                        treeRef.current?.previousMatch()
                                        pushLog('event', 'ref.previousMatch()')
                                    }}
                                    disabled={!useExternalQuery}
                                >
                                    Prev match
                                </button>
                                <button
                                    type="button"
                                    className="pg-btn"
                                    onClick={() => {
                                        treeRef.current?.nextMatch()
                                        pushLog('event', 'ref.nextMatch()')
                                    }}
                                    disabled={!useExternalQuery}
                                >
                                    Next match
                                </button>
                            </div>
                            <div className="pg-hint">
                                When enabled, this input controls the component search query. Use
                                the buttons (or Enter / Shift+Enter in this input) to navigate
                                matches via the ref API.
                            </div>
                        </div>

                        <div className="pg-split" />

                        <div className="pg-field">
                            <label className="pg-label" htmlFor="jumpPath">
                                Jump to path
                            </label>
                            <div className="pg-row">
                                <input
                                    id="jumpPath"
                                    className="pg-input"
                                    value={jumpPathRaw}
                                    onChange={(e) => setJumpPathRaw(e.target.value)}
                                    placeholder="e.g. address.city or hobbies.1"
                                />
                                <button
                                    type="button"
                                    className="pg-btn"
                                    onClick={() => {
                                        const p = formatPathInput(jumpPathRaw)
                                        treeRef.current?.scrollToPath(p)
                                        pushLog('event', `ref.scrollToPath(${JSON.stringify(p)})`)
                                    }}
                                >
                                    Scroll
                                </button>
                            </div>
                            <button
                                type="button"
                                className="pg-btn pg-btn-secondary"
                                onClick={() => {
                                    const paths = Array.from(
                                        treeRef.current?.getExpandedPaths() || []
                                    )
                                    pushLog('info', `Expanded paths: ${paths.length}`)
                                }}
                            >
                                Log Expanded Count
                            </button>
                        </div>

                        <div className="pg-split" />

                        <div className="pg-section-title">Coming soon</div>
                        <div className="pg-hint">
                            {
                                'These are placeholders for Phase 10+ (breadcrumb, keyboard navigation, etc.).'
                            }
                        </div>
                        <div className="pg-checkrow">
                            <label className="pg-check pg-check-disabled">
                                <input type="checkbox" disabled />
                                virtualized
                            </label>
                            <label className="pg-check pg-check-disabled">
                                <input type="checkbox" disabled />
                                keyboard nav
                            </label>
                            <label className="pg-check pg-check-disabled">
                                <input type="checkbox" disabled />
                                sticky breadcrumb
                            </label>
                        </div>
                    </div>
                </aside>

                <main className="pg-panel pg-preview">
                    <div className="pg-panel-title">Preview</div>
                    <div className="pg-preview-inner">
                        <div className="pg-viewer" style={{ height: viewerHeight }}>
                            <JsonTreeView
                                ref={treeRef}
                                data={data}
                                theme={theme}
                                defaultExpanded={defaultExpanded}
                                searchable={effectiveSearchable}
                                showBreadcrumb={showBreadcrumb}
                                indentSize={indentSize}
                                fontSize={fontSize}
                                externalSearchQuery={useExternalQuery ? externalQuery : undefined}
                                onNodeClick={handleNodeClick}
                                onSearchChange={handleSearchChange}
                            />
                        </div>
                    </div>
                </main>

                <section className="pg-panel pg-log">
                    <div className="pg-panel-title">Events</div>
                    <div className="pg-log-actions">
                        <button
                            type="button"
                            className="pg-btn pg-btn-secondary"
                            onClick={() => setLog([])}
                        >
                            Clear
                        </button>
                    </div>
                    <div className="pg-log-list">
                        {log.length === 0 ? (
                            <div className="pg-hint">No events yet.</div>
                        ) : (
                            log.map((item) => (
                                <div key={item.id} className={`pg-log-item pg-log-${item.kind}`}>
                                    <span className="pg-log-ts">{formatTime(item.ts)}</span>
                                    <span className="pg-log-msg">{item.message}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="pg-shortcuts">
                        <div className="pg-panel-title pg-panel-title-sub">Shortcuts</div>
                        <div className="pg-shortcut-row">
                            <code>Ctrl/Cmd+F</code>
                            <span>Focus search</span>
                        </div>
                        <div className="pg-shortcut-row">
                            <code>Enter</code>
                            <span>Toggle expand / next match (in search)</span>
                        </div>
                        <div className="pg-shortcut-row">
                            <code>Shift+Enter</code>
                            <span>Previous match (in search)</span>
                        </div>
                        <div className="pg-shortcut-row">
                            <code>Escape</code>
                            <span>Clear search</span>
                        </div>
                        <div className="pg-shortcut-row">
                            <code>↑ / ↓</code>
                            <span>Move focus</span>
                        </div>
                        <div className="pg-shortcut-row">
                            <code>← / →</code>
                            <span>Collapse / expand</span>
                        </div>
                        <div className="pg-shortcut-row">
                            <code>Home / End</code>
                            <span>First / last</span>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}

function formatTime(ts: number) {
    const d = new Date(ts)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
}

function safePreview(value: unknown) {
    try {
        if (typeof value === 'string') {
            return JSON.stringify(value.length > 120 ? `${value.slice(0, 120)}…` : value)
        }
        if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
            return String(value)
        }
        if (Array.isArray(value)) return `[Array(${value.length})]`
        if (typeof value === 'object') return '{Object}'
        return String(value)
    } catch {
        return '[unserializable]'
    }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
