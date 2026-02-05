import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react'
import { TreeNode } from './JsonTree'
import { SearchBar } from './SearchBar'
import { Breadcrumb } from './Breadcrumb'
import type { JsonTreeViewProps, JsonTreeViewRef, JsonValue } from './types'
import { getAllExpandablePaths } from './getAllExpandablePaths'
import { useSearch } from './useSearch'

type VisibleNode = {
    pathKey: string
    depth: number
    isExpandable: boolean
    isExpanded: boolean
}

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
    const rootRef = useRef<HTMLDivElement>(null)

    const searchInputRef = useRef<HTMLInputElement>(null)

    const [internalQuery, setInternalQuery] = useState('')
    const query = externalSearchQuery ?? internalQuery

    const { matches, currentIndex, currentMatch, next, previous, total } = useSearch(data, query)

    const [visiblePath, setVisiblePath] = useState<string[]>([])
    const observerStateRef = useRef<Map<string, number> | null>(null)

    const [focusedPathKey, setFocusedPathKey] = useState('')

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

    const renderFocusedPathKey = useMemo(() => {
        if (visibleKeys.has(focusedPathKey)) return focusedPathKey
        if (focusedPathKey === '' && visibleNodes.length > 0) return visibleNodes[0].pathKey

        let key = focusedPathKey
        while (key) {
            const parent = key.split('.').slice(0, -1).join('.')
            if (visibleKeys.has(parent)) return parent
            key = parent
        }
        return visibleKeys.has('') ? '' : (visibleNodes[0]?.pathKey ?? '')
    }, [focusedPathKey, visibleKeys, visibleNodes])

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() !== 'f') return
            if (!e.ctrlKey && !e.metaKey) return

            const root = rootRef.current
            if (!root) return
            const target = e.target as Node | null
            if (target && !root.contains(target)) return

            e.preventDefault()
            searchInputRef.current?.focus()
        }

        document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

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

    useEffect(() => {
        const root = scrollContainerRef.current
        if (!root) return

        const row = root.querySelector<HTMLElement>(`.jt-row[data-path="${renderFocusedPathKey}"]`)
        if (!row) return

        row.focus({ preventScroll: true })
        row.scrollIntoView({ block: 'nearest' })
    }, [renderFocusedPathKey])

    const handleNext = () => {
        if (total === 0) return
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % total
        const matchPath = matches[nextIndex].path
        scrollToPathInternal(matchPath)
        setFocusedPathKey(matchPath.join('.'))
        next()
    }

    const handlePrevious = () => {
        if (total === 0) return
        const nextIndex = currentIndex < 0 ? total - 1 : (currentIndex - 1 + total) % total
        const matchPath = matches[nextIndex].path
        scrollToPathInternal(matchPath)
        setFocusedPathKey(matchPath.join('.'))
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
            ref={rootRef}
        >
            {(searchable || showBreadcrumb) && (
                <div className="jt-toolbar">
                    {showBreadcrumb && (
                        <Breadcrumb
                            path={visiblePath}
                            onCrumbClick={(p) => {
                                scrollToPathInternal(p, { align: 'start' })
                                setFocusedPathKey(p.join('.'))
                            }}
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
            <div
                className="jt-scroll"
                ref={scrollContainerRef}
                role="tree"
                aria-label="JSON Tree View"
                onClickCapture={(e) => {
                    const target = e.target as HTMLElement | null
                    const row = target?.closest?.('.jt-row[data-path]') as HTMLElement | null
                    if (!row) return
                    const key = row.getAttribute('data-path') ?? ''
                    setFocusedPathKey(key)
                    row.focus({ preventScroll: true })
                }}
                onFocusCapture={(e) => {
                    const target = e.target as HTMLElement | null
                    const row = target?.closest?.('.jt-row[data-path]') as HTMLElement | null
                    if (!row) return
                    const key = row.getAttribute('data-path') ?? ''
                    setFocusedPathKey(key)
                }}
                onKeyDown={(e) => {
                    const idx = visibleNodes.findIndex((n) => n.pathKey === renderFocusedPathKey)
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
                        searchInputRef.current?.focus()
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
                }}
            >
                <TreeNode
                    value={data}
                    path={[]}
                    expandedPaths={expandedPaths}
                    onToggle={toggleExpand}
                    indentSize={indentSize}
                    onNodeClick={onNodeClick}
                    searchQuery={query}
                    currentMatch={currentMatch}
                    focusedPathKey={renderFocusedPathKey}
                />
            </div>
        </div>
    )
})

JsonTreeView.displayName = 'JsonTreeView'
