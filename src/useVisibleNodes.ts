import { useMemo } from 'react'
import type { JsonValue } from './types'

export type VisibleNode = {
    pathKey: string
    depth: number
    isExpandable: boolean
    isExpanded: boolean
}

export function useVisibleNodes(data: JsonValue, expandedPaths: Set<string>) {
    const visibleNodes = useMemo<VisibleNode[]>(() => {
        function visit(value: JsonValue, path: string[]): VisibleNode[] {
            const pathKey = path.join('.')
            const depth = path.length
            const isObj = value !== null && typeof value === 'object'
            const entries = isObj
                ? Array.isArray(value)
                    ? value.map((v, i) => [String(i), v] as const)
                    : Object.entries(value)
                : []
            const isExpandable = isObj && entries.length > 0
            const isExpanded = isExpandable && expandedPaths.has(pathKey)

            const nodes: VisibleNode[] = [{ pathKey, depth, isExpandable, isExpanded }]
            if (isExpandable && isExpanded) {
                for (const [key, val] of entries) {
                    nodes.push(...visit(val, [...path, key]))
                }
            }
            return nodes
        }

        return visit(data, [])
    }, [data, expandedPaths])

    const visibleKeys = useMemo(() => new Set(visibleNodes.map((n) => n.pathKey)), [visibleNodes])

    return { visibleNodes, visibleKeys }
}
