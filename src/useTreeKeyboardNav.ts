import { useCallback, useEffect } from 'react'
import type { VisibleNode } from './useVisibleNodes'

type Params = {
    scrollContainerRef: React.RefObject<HTMLElement | null>
    visibleNodes: VisibleNode[]
    visibleKeys: Set<string>
    focusedPathKey: string
    setFocusedPathKey: (next: string) => void
    toggleExpand: (pathKey: string) => void
    setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>
    internalQuery: string
    setInternalQuery: (next: string) => void
    externalSearchQuery?: string
    focusSearch: () => void
}

export function useTreeKeyboardNav({
    scrollContainerRef,
    visibleNodes,
    visibleKeys,
    focusedPathKey,
    setFocusedPathKey,
    toggleExpand,
    setExpandedPaths,
    internalQuery,
    setInternalQuery,
    externalSearchQuery,
    focusSearch,
}: Params) {
    useEffect(() => {
        const root = scrollContainerRef.current
        if (!root) return

        const row = root.querySelector<HTMLElement>(`.jt-row[data-path="${focusedPathKey}"]`)
        if (!row) return

        row.focus({ preventScroll: true })
        row.scrollIntoView({ block: 'nearest' })
    }, [focusedPathKey, scrollContainerRef])

    return useCallback(
        (e: React.KeyboardEvent) => {
            const idx = visibleNodes.findIndex((n) => n.pathKey === focusedPathKey)
            const current = idx >= 0 ? visibleNodes[idx] : visibleNodes[0]
            if (!current) return

            const focusAt = (i: number) => {
                const node = visibleNodes[Math.max(0, Math.min(visibleNodes.length - 1, i))]
                if (node) setFocusedPathKey(node.pathKey)
            }

            const toggleCurrent = () => {
                if (!current.isExpandable) return
                toggleExpand(current.pathKey)
            }

            if (e.key === 'ArrowDown') {
                e.preventDefault()
                focusAt(idx < 0 ? 0 : idx + 1)
                return
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault()
                focusAt(idx < 0 ? 0 : idx - 1)
                return
            }
            if (e.key === 'Home') {
                e.preventDefault()
                focusAt(0)
                return
            }
            if (e.key === 'End') {
                e.preventDefault()
                focusAt(visibleNodes.length - 1)
                return
            }
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                toggleCurrent()
                return
            }
            if (e.key === 'Escape') {
                if (externalSearchQuery !== undefined) return
                if (!internalQuery) return
                e.preventDefault()
                setInternalQuery('')
                focusSearch()
                return
            }
            if (e.key === 'ArrowRight') {
                if (!current.isExpandable) return
                e.preventDefault()
                if (!current.isExpanded) {
                    setExpandedPaths((prev) => new Set(prev).add(current.pathKey))
                    return
                }
                return
            }
            if (e.key === 'ArrowLeft') {
                e.preventDefault()
                if (current.isExpandable && current.isExpanded && current.pathKey !== '') {
                    setExpandedPaths((prev) => {
                        const next = new Set(prev)
                        next.delete(current.pathKey)
                        return next
                    })
                    return
                }

                if (!current.pathKey) return
                const parent = current.pathKey.split('.').slice(0, -1).join('.')
                if (visibleKeys.has(parent)) setFocusedPathKey(parent)
            }
        },
        [
            visibleNodes,
            visibleKeys,
            focusedPathKey,
            setFocusedPathKey,
            toggleExpand,
            setExpandedPaths,
            internalQuery,
            setInternalQuery,
            externalSearchQuery,
            focusSearch,
        ]
    )
}
