import { useState } from 'react'
import { TreeNode } from './JsonTree'
import type { JsonTreeViewProps, JsonValue } from './types'

export function JsonTreeView({
    data,
    defaultExpanded = true,
    theme = 'auto',
    className,
    indentSize = 20,
    fontSize = 13,
    searchable = true,
    showBreadcrumb = true,
    onNodeClick,
}: JsonTreeViewProps) {
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
        if (defaultExpanded) return getInitialExpandedPaths(data)
        return new Set(['']) // [''] this is to make root branch expanded>
    })

    const toggleExpand = (path: string) => {
        setExpandedPaths((prev) => {
            const next = new Set(prev)
            if (next.has(path)) next.delete(path)
            else next.add(path)

            return next
        })
    }

    console.log(expandedPaths)

    return (
        <div
            className={`react-json-treeview ${className || ''}`}
            data-theme={theme}
            style={{ fontSize }}
        >
            {searchable && (
                <div className="jt-search">
                    <input type="text" placeholder="Search..." />
                </div>
            )}
            {showBreadcrumb && <div className="jt-breadcrumb">Breadcrumb placeholder</div>}
            <TreeNode
                value={data}
                path={[]}
                expandedPaths={expandedPaths}
                onToggle={toggleExpand}
                indentSize={indentSize}
                onNodeClick={onNodeClick}
            />
        </div>
    )
}

export function getInitialExpandedPaths(value: JsonValue, currentPath: string[] = []): Set<string> {
    const paths = new Set<string>()

    if (value !== null && typeof value === 'object') {
        const entries = Array.isArray(value)
            ? value.map((v, i) => [String(i), v] as const)
            : Object.entries(value)

        const pathKey = currentPath.join('.')
        if (entries.length > 0) paths.add(pathKey)

        for (const [key, val] of entries) {
            const childPaths = getInitialExpandedPaths(val, [...currentPath, key])
            childPaths.forEach((p) => paths.add(p))
        }
    }

    return paths
}
