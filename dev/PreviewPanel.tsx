import React from 'react'
import { JsonTreeView } from '../src/JsonTreeView'
import type { JsonTreeViewRef, JsonValue, SearchMatch } from '../src/types'

type Props = {
    treeRef: React.RefObject<JsonTreeViewRef | null>
    data: JsonValue
    theme: 'light' | 'dark' | 'auto'
    defaultExpanded: boolean
    searchable: boolean
    showBreadcrumb: boolean
    indentSize: number
    fontSize: number
    viewerHeight: number
    externalSearchQuery?: string
    onNodeClick: (path: string[], value: JsonValue) => void
    onSearchChange: (q: string, matches: SearchMatch[]) => void
}

export function PreviewPanel({
    treeRef,
    data,
    theme,
    defaultExpanded,
    searchable,
    showBreadcrumb,
    indentSize,
    fontSize,
    viewerHeight,
    externalSearchQuery,
    onNodeClick,
    onSearchChange,
}: Props) {
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
                        onNodeClick={onNodeClick}
                        onSearchChange={onSearchChange}
                    />
                </div>
            </div>
        </main>
    )
}
