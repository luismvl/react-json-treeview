import React from 'react'
import type { JsonTreeViewRef } from '../src/types'
import type { DataPreset, Theme } from './presets'

type Props = {
    treeRef: React.RefObject<JsonTreeViewRef | null>

    preset: DataPreset
    setPreset: (v: DataPreset) => void
    theme: Theme
    setTheme: (v: Theme) => void

    defaultExpanded: boolean
    setDefaultExpanded: (v: boolean) => void
    searchable: boolean
    setSearchable: (v: boolean) => void
    showBreadcrumb: boolean
    setShowBreadcrumb: (v: boolean) => void

    indentSize: number
    setIndentSize: (v: number) => void
    fontSize: number
    setFontSize: (v: number) => void
    viewerHeight: number
    setViewerHeight: (v: number) => void

    useExternalQuery: boolean
    setUseExternalQuery: (v: boolean) => void
    externalQuery: string
    setExternalQuery: (v: string) => void

    deepDepth: number
    setDeepDepth: (v: number) => void
    wideWidth: number
    setWideWidth: (v: number) => void
    bigGroups: number
    setBigGroups: (v: number) => void
    bigItemsPerGroup: number
    setBigItemsPerGroup: (v: number) => void

    jumpPathRaw: string
    setJumpPathRaw: (v: string) => void
    onJumpToPath: () => void
    onLogExpandedCount: () => void

    pushLog: (kind: 'info' | 'event' | 'warn', message: string) => void
}

export function ControlsPanel(props: Props) {
    const {
        treeRef,
        preset,
        setPreset,
        theme,
        setTheme,
        defaultExpanded,
        setDefaultExpanded,
        searchable,
        setSearchable,
        showBreadcrumb,
        setShowBreadcrumb,
        indentSize,
        setIndentSize,
        fontSize,
        setFontSize,
        viewerHeight,
        setViewerHeight,
        useExternalQuery,
        setUseExternalQuery,
        externalQuery,
        setExternalQuery,
        deepDepth,
        setDeepDepth,
        wideWidth,
        setWideWidth,
        bigGroups,
        setBigGroups,
        bigItemsPerGroup,
        setBigItemsPerGroup,
        jumpPathRaw,
        setJumpPathRaw,
        onJumpToPath,
        onLogExpandedCount,
        pushLog,
    } = props

    return (
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
                                onChange={(e) => setBigItemsPerGroup(Number(e.target.value))}
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
                        When enabled, this input controls the component search query. Use the
                        buttons (or Enter / Shift+Enter in this input) to navigate matches via the
                        ref API.
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
                        <button type="button" className="pg-btn" onClick={onJumpToPath}>
                            Scroll
                        </button>
                    </div>
                    <button
                        type="button"
                        className="pg-btn pg-btn-secondary"
                        onClick={onLogExpandedCount}
                    >
                        Log Expanded Count
                    </button>
                </div>

                <div className="pg-split" />

                <div className="pg-section-title">Up Next</div>
                <div className="pg-hint">
                    Phase 12 is testing (Vitest + React Testing Library). After that we can harden
                    accessibility, performance, and API surface.
                </div>
                <div className="pg-checkrow">
                    <label className="pg-check pg-check-disabled">
                        <input type="checkbox" disabled />
                        virtualization
                    </label>
                    <label className="pg-check pg-check-disabled">
                        <input type="checkbox" disabled />
                        sortKeys
                    </label>
                    <label className="pg-check pg-check-disabled">
                        <input type="checkbox" disabled />
                        maxDepth
                    </label>
                    <label className="pg-check pg-check-disabled">
                        <input type="checkbox" disabled />
                        copy path
                    </label>
                    <label className="pg-check pg-check-disabled">
                        <input type="checkbox" disabled />
                        a11y polish
                    </label>
                </div>
            </div>
        </aside>
    )
}
