import React from 'react'
import { JsonTreeView } from '../src/JsonTreeView'
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
    } = state
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
                    />
                </div>
            </div>
        </main>
    )
}
