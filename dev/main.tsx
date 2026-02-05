import React, { useCallback, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import '../src/styles/styles.css'
import type { JsonTreeViewRef, JsonValue, SearchMatch } from '../src/types'
import { ControlsPanel } from './ControlsPanel'
import './playground.css'
import { EventsPanel } from './EventsPanel'
import { buildBigData, buildDeepData, buildWideData, sampleData } from './presets'
import type { DataPreset, Theme } from './presets'
import { PreviewPanel } from './PreviewPanel'
import { formatPathInput, nowId, safePreview, type LogItem } from './playgroundUtils'

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

    const onJumpToPath = useCallback(() => {
        const p = formatPathInput(jumpPathRaw)
        treeRef.current?.scrollToPath(p)
        pushLog('event', `ref.scrollToPath(${JSON.stringify(p)})`)
    }, [jumpPathRaw, pushLog])

    const onLogExpandedCount = useCallback(() => {
        const paths = Array.from(treeRef.current?.getExpandedPaths() || [])
        pushLog('info', `Expanded paths: ${paths.length}`)
    }, [pushLog])

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
                <ControlsPanel
                    treeRef={treeRef}
                    preset={preset}
                    setPreset={setPreset}
                    theme={theme}
                    setTheme={setTheme}
                    defaultExpanded={defaultExpanded}
                    setDefaultExpanded={setDefaultExpanded}
                    searchable={searchable}
                    setSearchable={setSearchable}
                    showBreadcrumb={showBreadcrumb}
                    setShowBreadcrumb={setShowBreadcrumb}
                    indentSize={indentSize}
                    setIndentSize={setIndentSize}
                    fontSize={fontSize}
                    setFontSize={setFontSize}
                    viewerHeight={viewerHeight}
                    setViewerHeight={setViewerHeight}
                    useExternalQuery={useExternalQuery}
                    setUseExternalQuery={setUseExternalQuery}
                    externalQuery={externalQuery}
                    setExternalQuery={setExternalQuery}
                    deepDepth={deepDepth}
                    setDeepDepth={setDeepDepth}
                    wideWidth={wideWidth}
                    setWideWidth={setWideWidth}
                    bigGroups={bigGroups}
                    setBigGroups={setBigGroups}
                    bigItemsPerGroup={bigItemsPerGroup}
                    setBigItemsPerGroup={setBigItemsPerGroup}
                    jumpPathRaw={jumpPathRaw}
                    setJumpPathRaw={setJumpPathRaw}
                    onJumpToPath={onJumpToPath}
                    onLogExpandedCount={onLogExpandedCount}
                    pushLog={pushLog}
                />

                <PreviewPanel
                    treeRef={treeRef}
                    data={data}
                    theme={theme}
                    defaultExpanded={defaultExpanded}
                    searchable={searchable}
                    showBreadcrumb={showBreadcrumb}
                    indentSize={indentSize}
                    fontSize={fontSize}
                    viewerHeight={viewerHeight}
                    externalSearchQuery={useExternalQuery ? externalQuery : undefined}
                    onNodeClick={handleNodeClick}
                    onSearchChange={handleSearchChange}
                />

                <EventsPanel log={log} onClear={() => setLog([])} />
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
