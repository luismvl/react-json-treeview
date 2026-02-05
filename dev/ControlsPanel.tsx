import React from 'react'
import { usePlayground, type RenderValueMode } from './PlaygroundContext'
import type { DataPreset, Theme } from './presets'

export function ControlsPanel() {
    const { state, setField, actions, dataError } = usePlayground()
    const {
        preset,
        theme,
        defaultExpanded,
        searchable,
        showBreadcrumb,
        indentSize,
        fontSize,
        viewerHeight,
        useExternalQuery,
        externalQuery,
        renderValueMode,
        deepDepth,
        wideWidth,
        bigGroups,
        bigItemsPerGroup,
        customJsonRaw,
        jumpPathRaw,
    } = state

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
                        onChange={(e) => setField('preset', e.target.value as DataPreset)}
                    >
                        <option value="sample">Sample</option>
                        <option value="deep">Deep nesting</option>
                        <option value="wide">Wide object</option>
                        <option value="big">Big dataset</option>
                        <option value="custom">Custom JSON</option>
                    </select>
                </div>

                {preset === 'custom' && (
                    <div className="pg-field">
                        <label className="pg-label" htmlFor="customJson">
                            Custom JSON
                        </label>
                        <textarea
                            id="customJson"
                            className="pg-textarea"
                            value={customJsonRaw}
                            onChange={(e) => setField('customJsonRaw', e.target.value)}
                            spellCheck={false}
                            rows={10}
                        />
                        {dataError ? (
                            <div className="pg-error">
                                Invalid JSON (showing last valid value): {dataError}
                            </div>
                        ) : (
                            <div className="pg-hint">
                                Tip: include values like <code>true</code>, <code>null</code>, and
                                strings containing <code>needle</code> to exercise search.
                            </div>
                        )}
                    </div>
                )}

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
                            onChange={(e) => setField('deepDepth', Number(e.target.value))}
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
                            onChange={(e) => setField('wideWidth', Number(e.target.value))}
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
                                onChange={(e) => setField('bigGroups', Number(e.target.value))}
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
                                    setField('bigItemsPerGroup', Number(e.target.value))
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
                        onChange={(e) => setField('theme', e.target.value as Theme)}
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
                            onChange={(e) => setField('defaultExpanded', e.target.checked)}
                        />
                        defaultExpanded
                    </label>
                    <label className="pg-check">
                        <input
                            type="checkbox"
                            checked={searchable}
                            onChange={(e) => setField('searchable', e.target.checked)}
                            disabled={useExternalQuery}
                        />
                        searchable
                    </label>
                    <label className="pg-check">
                        <input
                            type="checkbox"
                            checked={showBreadcrumb}
                            onChange={(e) => setField('showBreadcrumb', e.target.checked)}
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
                        onChange={(e) => setField('indentSize', Number(e.target.value))}
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
                        onChange={(e) => setField('fontSize', Number(e.target.value))}
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
                        onChange={(e) => setField('viewerHeight', Number(e.target.value))}
                    />
                </div>

                <div className="pg-split" />

                <div className="pg-field">
                    <label className="pg-label" htmlFor="renderValueMode">
                        renderValue demo
                    </label>
                    <select
                        id="renderValueMode"
                        className="pg-select"
                        value={renderValueMode}
                        onChange={(e) =>
                            setField('renderValueMode', e.target.value as RenderValueMode)
                        }
                    >
                        <option value="off">Off</option>
                        <option value="numbers">Numbers only</option>
                        <option value="all">All primitives</option>
                    </select>
                    <div className="pg-hint">
                        This uses the public <code>renderValue</code> prop. Returning a custom node
                        overrides the default formatting/highlighting for that value.
                    </div>
                </div>

                <div className="pg-split" />

                <div className="pg-field">
                    <label className="pg-check">
                        <input
                            type="checkbox"
                            checked={useExternalQuery}
                            onChange={(e) => setField('useExternalQuery', e.target.checked)}
                        />
                        externalSearchQuery (controlled)
                    </label>
                    <input
                        className="pg-input"
                        value={externalQuery}
                        onChange={(e) => setField('externalQuery', e.target.value)}
                        placeholder='Try "needle", "true", "null"...'
                        disabled={!useExternalQuery}
                        onKeyDown={(e) => {
                            if (!useExternalQuery) return
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                if (e.shiftKey) {
                                    actions.previousMatch()
                                } else {
                                    actions.nextMatch()
                                }
                            } else if (e.key === 'Escape') {
                                e.preventDefault()
                                setField('externalQuery', '')
                                actions.pushLog('event', 'externalQuery cleared')
                            }
                        }}
                    />
                    <div className="pg-row">
                        <button
                            type="button"
                            className="pg-btn"
                            onClick={actions.previousMatch}
                            disabled={!useExternalQuery}
                        >
                            Prev match
                        </button>
                        <button
                            type="button"
                            className="pg-btn"
                            onClick={actions.nextMatch}
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
                            onChange={(e) => setField('jumpPathRaw', e.target.value)}
                            placeholder="e.g. address.city or hobbies.1"
                        />
                        <button type="button" className="pg-btn" onClick={actions.jumpToPath}>
                            Scroll
                        </button>
                    </div>
                    <button
                        type="button"
                        className="pg-btn pg-btn-secondary"
                        onClick={actions.logExpandedCount}
                    >
                        Log Expanded Count
                    </button>
                </div>

                <div className="pg-split" />

                <div className="pg-section-title">Future Ideas</div>
                <div className="pg-hint">
                    Potential features for future versions. None are currently planned.
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
