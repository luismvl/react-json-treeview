import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { TreeNode } from './JsonTree'
import { SearchBar } from './SearchBar'
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

    const containerRef = useRef<HTMLDivElement>(null)

    const searchInputRef = useRef<HTMLInputElement>(null)

    const [internalQuery, setInternalQuery] = useState('')
    const query = externalSearchQuery ?? internalQuery

    const { matches, currentIndex, currentMatch, next, previous, total } = useSearch(data, query)

    const toggleExpand = (path: string) => {
        setExpandedPaths((prev) => {
            const next = new Set(prev)
            if (next.has(path)) next.delete(path)
            else next.add(path)

            return next
        })
    }

    const scrollToPathInternal = useCallback((path: string[]) => {
        const ancestorPaths = new Set<string>()
        for (let i = 1; i <= path.length; i++) {
            const ancestorPath = path.slice(0, i).join('.')
            ancestorPaths.add(ancestorPath)
        }

        setExpandedPaths((prev) => new Set([...prev, ...ancestorPaths]))

        requestAnimationFrame(() => {
            const pathKey = path.join('.')
            const element = containerRef.current?.querySelector(`[data-path="${pathKey}"]`)
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        })
    }, [])

    // Avoid "callback identity" loops (e.g. consumer passes an inline function that sets state).
    const onSearchChangeRef = useRef(onSearchChange)
    useEffect(() => {
        onSearchChangeRef.current = onSearchChange
    }, [onSearchChange])

    useEffect(() => {
        onSearchChangeRef.current?.(query, matches)
    }, [query, matches])

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
            ref={containerRef}
        >
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
            {showBreadcrumb && <div className="jt-breadcrumb">Breadcrumb placeholder</div>}
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
