import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { TreeNode } from './JsonTree'
import { SearchBar } from './SearchBar'
import { Breadcrumb } from './Breadcrumb'
import type { JsonTreeViewProps, JsonTreeViewRef, JsonValue } from './types'
import { useSearch } from './useSearch'

export const JsonTreeView = forwardRef<JsonTreeViewRef, JsonTreeViewProps>(function (props, ref) {
    const {
        data,
        defaultExpanded = true,
        theme = 'auto',
        className,
        indentSize = 20,
        fontSize = 13,
        searchable = true,
        showBreadcrumb = true,
        onNodeClick,
        onSearchChange,
        externalSearchQuery,
    } = props

    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
        if (defaultExpanded) return getAllExpandablePaths(data)
        return new Set(['']) // [''] this is to make root branch expanded>
    })

    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const searchInputRef = useRef<HTMLInputElement>(null)

    const [internalQuery, setInternalQuery] = useState('')
    const query = externalSearchQuery ?? internalQuery

    const { matches, currentIndex, currentMatch, next, previous, total } = useSearch(data, query)

    const [visiblePath, setVisiblePath] = useState<string[]>([])
    const observerStateRef = useRef<Map<string, number> | null>(null)

    const toggleExpand = (path: string) => {
        setExpandedPaths((prev) => {
            const next = new Set(prev)
            if (next.has(path)) next.delete(path)
            else next.add(path)

            return next
        })
    }

    const scrollToPathInternal = useCallback(
        (path: string[], opts?: { align?: ScrollLogicalPosition }) => {
            const align: ScrollLogicalPosition = opts?.align ?? 'center'
            const root = scrollContainerRef.current
            if (!root) return

            if (path.length === 0) {
                root.scrollTo({ top: 0, behavior: 'smooth' })
                return
            }

            const ancestorPaths = new Set<string>()
            for (let i = 1; i <= path.length; i++) {
                const ancestorPath = path.slice(0, i).join('.')
                ancestorPaths.add(ancestorPath)
            }

            setExpandedPaths((prev) => new Set([...prev, ...ancestorPaths]))

            // Wait for expansion + layout to settle before scrolling.
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const pathKey = path.join('.')
                    const row =
                        root.querySelector<HTMLElement>(`.jt-row[data-path="${pathKey}"]`) ??
                        root.querySelector<HTMLElement>(`[data-path="${pathKey}"]`)
                    if (row) row.scrollIntoView({ behavior: 'smooth', block: align })
                })
            })
        },
        []
    )

    // Avoid "callback identity" loops (e.g. consumer passes an inline function that sets state).
    const onSearchChangeRef = useRef(onSearchChange)
    useEffect(() => {
        onSearchChangeRef.current = onSearchChange
    }, [onSearchChange])

    useEffect(() => {
        onSearchChangeRef.current?.(query, matches)
    }, [query, matches])

    const visiblePathThrottleRef = useRef<{
        lastUpdateTs: number
        pendingKey: string | null
        timeoutId: number | null
    }>({ lastUpdateTs: 0, pendingKey: null, timeoutId: null })

    const scheduleVisiblePathUpdate = useCallback((pathKey: string) => {
        const state = visiblePathThrottleRef.current
        state.pendingKey = pathKey

        const now = Date.now()
        const throttleMs = 100
        const dueIn = state.lastUpdateTs + throttleMs - now

        const apply = () => {
            state.timeoutId = null
            state.lastUpdateTs = Date.now()

            const key = state.pendingKey ?? ''
            const nextPath = key ? key.split('.') : []
            setVisiblePath((prev) => {
                if (prev.length === nextPath.length && prev.every((s, i) => s === nextPath[i])) {
                    return prev
                }
                return nextPath
            })
        }

        if (dueIn <= 0) {
            apply()
            return
        }

        if (state.timeoutId !== null) return
        state.timeoutId = window.setTimeout(apply, dueIn)
    }, [])

    useEffect(() => {
        if (!showBreadcrumb) return
        const scrollRoot = scrollContainerRef.current
        if (!scrollRoot) return

        // If the viewer isn't constrained, the page will scroll instead of the internal container.
        // In that case, observe relative to the viewport so breadcrumbs still update.
        const ioRoot: HTMLElement | null =
            scrollRoot.scrollHeight > scrollRoot.clientHeight ? scrollRoot : null

        const observer = new IntersectionObserver(
            (entries) => {
                // Track intersecting elements across callbacks for stable "topmost" selection.
                let state = observerStateRef.current
                if (!state) {
                    state = new Map<string, number>()
                    observerStateRef.current = state
                }

                for (const entry of entries) {
                    const el = entry.target as HTMLElement
                    const key = el.getAttribute('data-path')
                    if (key === null) continue

                    if (!entry.isIntersecting) {
                        state.delete(key)
                        continue
                    }

                    const rootTop = entry.rootBounds?.top ?? 0
                    const top = entry.boundingClientRect.top - rootTop
                    state.set(key, top)
                }

                let bestKey: string | null = null
                let bestTop = Number.POSITIVE_INFINITY
                for (const [key, top] of state.entries()) {
                    if (top < bestTop) {
                        bestTop = top
                        bestKey = key
                    }
                }

                if (bestKey !== null) {
                    scheduleVisiblePathUpdate(bestKey)
                }
            },
            {
                root: ioRoot,
                // Restrict the "active" zone to the top 10% of the scroll area.
                rootMargin: '0px 0px -90% 0px',
                threshold: 0,
            }
        )

        const targets = scrollRoot.querySelectorAll<HTMLElement>('.jt-row[data-path]')
        targets.forEach((t) => observer.observe(t))

        return () => {
            observer.disconnect()
            observerStateRef.current?.clear()
        }
    }, [data, expandedPaths, scheduleVisiblePathUpdate, showBreadcrumb])

    useEffect(() => {
        const state = visiblePathThrottleRef.current
        return () => {
            if (state.timeoutId !== null) {
                window.clearTimeout(state.timeoutId)
                state.timeoutId = null
            }
        }
    }, [])

    const handleNext = () => {
        if (total === 0) return
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % total
        scrollToPathInternal(matches[nextIndex].path)
        next()
    }

    const handlePrevious = () => {
        if (total === 0) return
        const nextIndex = currentIndex < 0 ? total - 1 : (currentIndex - 1 + total) % total
        scrollToPathInternal(matches[nextIndex].path)
        previous()
    }

    useImperativeHandle(ref, () => ({
        expandAll() {
            const allPaths = getAllExpandablePaths(data)
            setExpandedPaths(allPaths)
        },

        collapseAll() {
            setExpandedPaths(new Set(['']))
        },
        scrollToPath(path) {
            scrollToPathInternal(path)
        },

        focusSearch() {
            searchInputRef.current?.focus()
        },
        getExpandedPaths() {
            return new Set(expandedPaths)
        },
        nextMatch() {
            handleNext()
        },
        previousMatch() {
            handlePrevious()
        },
    }))

    return (
        <div
            className={`react-json-treeview ${className || ''}`}
            data-theme={theme}
            style={{ fontSize }}
        >
            {(searchable || showBreadcrumb) && (
                <div className="jt-toolbar">
                    {showBreadcrumb && (
                        <Breadcrumb
                            path={visiblePath}
                            onCrumbClick={(p) => scrollToPathInternal(p, { align: 'start' })}
                        />
                    )}
                    {searchable && (
                        <SearchBar
                            ref={searchInputRef}
                            query={query}
                            onQueryChange={setInternalQuery}
                            total={total}
                            currentIndex={currentIndex}
                            onNext={handleNext}
                            onPrevious={handlePrevious}
                            disabled={externalSearchQuery !== undefined}
                        />
                    )}
                </div>
            )}
            <div className="jt-scroll" ref={scrollContainerRef}>
                <TreeNode
                    value={data}
                    path={[]}
                    expandedPaths={expandedPaths}
                    onToggle={toggleExpand}
                    indentSize={indentSize}
                    onNodeClick={onNodeClick}
                    searchQuery={query}
                    currentMatch={currentMatch}
                />
            </div>
        </div>
    )
})

JsonTreeView.displayName = 'JsonTreeView'

/**
 * Recursively get all expandable paths in the JSON data
 * @param value The JSON value
 * @param currentPath The current path (used in recursion)
 * @returns A set of expandable paths
 */
export function getAllExpandablePaths(value: JsonValue, currentPath: string[] = []): Set<string> {
    const paths = new Set<string>()

    if (value !== null && typeof value === 'object') {
        const entries = Array.isArray(value)
            ? value.map((v, i) => [String(i), v] as const)
            : Object.entries(value)

        const pathKey = currentPath.join('.')
        if (entries.length > 0) paths.add(pathKey)

        for (const [key, val] of entries) {
            const childPaths = getAllExpandablePaths(val, [...currentPath, key])
            childPaths.forEach((p) => paths.add(p))
        }
    }

    return paths
}
