import React, { useMemo } from 'react'
import { JsonTreeView } from '../src/JsonTreeView'
import type { JsonPrimitive, JsonPrimitiveType, RenderValueContext } from '../src/types'
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
        return (
            value: JsonPrimitive,
            path: string[],
            type: JsonPrimitiveType,
            ctx: RenderValueContext
        ) => {
            if (renderValueMode === 'numbers' && type !== 'number') return null

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
                            title={ctx.pathKey}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {ctx.defaultRenderer()}
                        </a>
                    )
                }
                return (
                    <span className="pg-chip pg-chip-string" title={ctx.pathKey}>
                        {ctx.defaultRenderer()}
                    </span>
                )
            }

            if (type === 'number') {
                return (
                    <span className="pg-chip pg-chip-number" title={ctx.pathKey}>
                        {ctx.defaultRenderer()}
                    </span>
                )
            }

            if (type === 'boolean') {
                return (
                    <span
                        className={`pg-chip ${value ? 'pg-chip-true' : 'pg-chip-false'}`}
                        title={ctx.pathKey}
                    >
                        {ctx.defaultRenderer()}
                    </span>
                )
            }

            return (
                <span className="pg-chip pg-chip-null" title={ctx.pathKey}>
                    {ctx.defaultRenderer()}
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
