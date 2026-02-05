import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Breadcrumb } from './Breadcrumb'
import { TreeNode } from './JsonTree'
import { SearchBar } from './SearchBar'
import { getAllExpandablePaths } from './getAllExpandablePaths'
import type { JsonTreeViewProps, JsonTreeViewRef } from './types'
import { useBreadcrumbObserver } from './useBreadcrumbObserver'
import { useResolvedFocusedKey } from './useResolvedFocusedKey'
import { useScopedKeydown } from './useScopedKeydown'
import { useScrollToPath } from './useScrollToPath'
import { useSearch } from './useSearch'
import { useTreeKeyboardNav } from './useTreeKeyboardNav'
import { useVisibleNodes } from './useVisibleNodes'

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
        return new Set(['']) // ensure root branch can open
    })

    const rootRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const [internalQuery, setInternalQuery] = useState('')
    const query = externalSearchQuery ?? internalQuery

    const { matches, currentIndex, currentMatch, next, previous, total } = useSearch(data, query)

    const [focusedPathKey, setFocusedPathKey] = useState('')
    const { visibleNodes, visibleKeys } = useVisibleNodes(data, expandedPaths)
    const resolvedFocusedKey = useResolvedFocusedKey(focusedPathKey, visibleKeys, visibleNodes)
    const visiblePath = useBreadcrumbObserver(scrollContainerRef, showBreadcrumb, expandedPaths)

    const toggleExpand = useCallback((pathKey: string) => {
        setExpandedPaths((prev) => {
            const next = new Set(prev)
            if (next.has(pathKey)) next.delete(pathKey)
            else next.add(pathKey)
            return next
        })
    }, [])

    const scrollToPathInternal = useScrollToPath(scrollContainerRef, setExpandedPaths)

    const focusSearch = useCallback(() => {
        searchInputRef.current?.focus()
    }, [])

    // Avoid "callback identity" loops (e.g. consumer passes an inline function that sets state).
    const onSearchChangeRef = useRef(onSearchChange)
    useEffect(() => {
        onSearchChangeRef.current = onSearchChange
    }, [onSearchChange])

    useEffect(() => {
        onSearchChangeRef.current?.(query, matches)
    }, [query, matches])

    useScopedKeydown(
        rootRef,
        useCallback(
            (e) => {
                if (e.key.toLowerCase() !== 'f') return
                if (!e.ctrlKey && !e.metaKey) return
                e.preventDefault()
                focusSearch()
            },
            [focusSearch]
        )
    )

    const onTreeKeyDown = useTreeKeyboardNav({
        scrollContainerRef,
        visibleNodes,
        visibleKeys,
        focusedPathKey: resolvedFocusedKey,
        setFocusedPathKey,
        toggleExpand,
        setExpandedPaths,
        internalQuery,
        setInternalQuery,
        externalSearchQuery,
        focusSearch,
    })

    const handleNext = useCallback(() => {
        if (total === 0) return
        const nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % total
        const matchPath = matches[nextIndex].path
        scrollToPathInternal(matchPath)
        setFocusedPathKey(matchPath.join('.'))
        next()
    }, [currentIndex, matches, next, scrollToPathInternal, total])

    const handlePrevious = useCallback(() => {
        if (total === 0) return
        const nextIndex = currentIndex < 0 ? total - 1 : (currentIndex - 1 + total) % total
        const matchPath = matches[nextIndex].path
        scrollToPathInternal(matchPath)
        setFocusedPathKey(matchPath.join('.'))
        previous()
    }, [currentIndex, matches, previous, scrollToPathInternal, total])

    useImperativeHandle(
        ref,
        () => ({
            expandAll() {
                setExpandedPaths(getAllExpandablePaths(data))
            },
            collapseAll() {
                setExpandedPaths(new Set(['']))
            },
            scrollToPath(path) {
                scrollToPathInternal(path)
            },
            focusSearch() {
                focusSearch()
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
        }),
        [data, expandedPaths, focusSearch, handleNext, handlePrevious, scrollToPathInternal]
    )

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
                onKeyDown={onTreeKeyDown}
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
                    focusedPathKey={resolvedFocusedKey}
                />
            </div>
        </div>
    )
})

JsonTreeView.displayName = 'JsonTreeView'
