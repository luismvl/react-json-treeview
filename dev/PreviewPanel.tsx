import React, { useMemo } from 'react'
import { JsonTreeView } from '../src/JsonTreeView'
import type { JsonPrimitive, JsonPrimitiveType } from '../src/types'
import { usePlayground } from './PlaygroundContext'

export function PreviewPanel() {
    const { treeRef, data, externalSearchQuery, state, actions } = usePlayground()
    const {
        theme,
        defaultExpanded,
        searchable,
        showBreadcrumb,
        indentSize,
        fontSize,
        viewerHeight,
        renderValueMode,
    } = state

    const renderValue = useMemo(() => {
        if (renderValueMode === 'off') return undefined
        return (value: JsonPrimitive, path: string[], type: JsonPrimitiveType) => {
            if (renderValueMode === 'numbers' && type !== 'number') return null

            const title = path.length === 0 ? '(root)' : path.join('.')

            if (type === 'string') {
                const s = value as string
                const isUrl = /^https?:\/\//i.test(s)
                if (isUrl) {
                    return (
                        <a
                            className="pg-link"
                            href={s}
                            target="_blank"
                            rel="noreferrer"
                            title={title}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {s}
                        </a>
                    )
                }
                return (
                    <span className="pg-chip pg-chip-string" title={title}>
                        &quot;{s}&quot;
                    </span>
                )
            }

            if (type === 'number') {
                return (
                    <span className="pg-chip pg-chip-number" title={title}>
                        {String(value)}
                    </span>
                )
            }

            if (type === 'boolean') {
                return (
                    <span
                        className={`pg-chip ${value ? 'pg-chip-true' : 'pg-chip-false'}`}
                        title={title}
                    >
                        {String(value)}
                    </span>
                )
            }

            return (
                <span className="pg-chip pg-chip-null" title={title}>
                    null
                </span>
            )
        }
    }, [renderValueMode])

    return (
        <main className="pg-panel pg-preview">
            <div className="pg-panel-title">Preview</div>
            <div className="pg-preview-inner">
                <div className="pg-viewer" style={{ height: viewerHeight }}>
                    <JsonTreeView
                        ref={treeRef}
                        data={data}
                        theme={theme}
                        defaultExpanded={defaultExpanded}
                        searchable={searchable}
                        showBreadcrumb={showBreadcrumb}
                        indentSize={indentSize}
                        fontSize={fontSize}
                        externalSearchQuery={externalSearchQuery}
                        onNodeClick={actions.onNodeClick}
                        onSearchChange={actions.onSearchChange}
                        renderValue={renderValue}
                    />
                </div>
            </div>
        </main>
    )
}
