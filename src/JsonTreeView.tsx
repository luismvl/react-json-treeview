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
}: JsonTreeViewProps) {
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
        if (defaultExpanded) return getInitialExpandedPaths(data)
        return new Set()
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
            <TreeNode
                value={data}
                path={[]}
                expandedPaths={expandedPaths}
                onToggle={toggleExpand}
                indentSize={indentSize}
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
