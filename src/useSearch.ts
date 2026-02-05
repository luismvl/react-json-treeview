import { useCallback, useMemo, useState } from 'react'
import { JsonValue, SearchMatch } from './types'

export function useSearch(data: JsonValue, query: string) {
    const trimmedQuery = query.trim()

    const matches = useMemo(() => {
        if (!trimmedQuery) return []
        return findMatches(data, trimmedQuery, [])
    }, [data, trimmedQuery])

    type NavState = { queryKey: string; index: number }
    // `index === -1` means "no active match yet" (user hasn't navigated).
    const [nav, setNav] = useState<NavState>({ queryKey: trimmedQuery, index: -1 })

    const total = matches.length
    const currentIndex = nav.queryKey === trimmedQuery ? nav.index : -1
    const currentMatch = currentIndex >= 0 ? (matches[currentIndex] ?? null) : null

    const next = useCallback(() => {
        if (total === 0) return
        setNav((prev) => {
            const baseIndex = prev.queryKey === trimmedQuery ? prev.index : -1
            const nextIndex = baseIndex < 0 ? 0 : (baseIndex + 1) % total
            return { queryKey: trimmedQuery, index: nextIndex }
        })
    }, [total, trimmedQuery])

    const previous = useCallback(() => {
        if (total === 0) return
        setNav((prev) => {
            const baseIndex = prev.queryKey === trimmedQuery ? prev.index : -1
            const nextIndex = baseIndex < 0 ? total - 1 : (baseIndex - 1 + total) % total
            return { queryKey: trimmedQuery, index: nextIndex }
        })
    }, [total, trimmedQuery])

    return { matches, currentIndex, currentMatch, next, previous, total }
}

function findMatches(value: JsonValue, query: string, path: string[]): SearchMatch[] {
    const matches: SearchMatch[] = []

    const q = query.toLowerCase()

    const pushValueMatch = (val: JsonValue, matchPath: string[]) => {
        if (val === null) {
            if ('null'.includes(q)) {
                matches.push({
                    path: matchPath,
                    key: matchPath.length > 0 ? matchPath[matchPath.length - 1] : '',
                    value: 'null',
                    type: 'value',
                })
            }
            return
        }

        if (typeof val === 'string') {
            if (val.toLowerCase().includes(q)) {
                matches.push({
                    path: matchPath,
                    key: matchPath.length > 0 ? matchPath[matchPath.length - 1] : '',
                    value: val,
                    type: 'value',
                })
            }
            return
        }

        if (typeof val === 'number' || typeof val === 'boolean') {
            const s = String(val)
            if (s.toLowerCase().includes(q)) {
                matches.push({
                    path: matchPath,
                    key: matchPath.length > 0 ? matchPath[matchPath.length - 1] : '',
                    value: s,
                    type: 'value',
                })
            }
        }
    }

    // Root primitive support
    if (value === null || typeof value !== 'object') {
        pushValueMatch(value, path)
        return matches
    }

    // Objects / arrays
    if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
            const childKey = String(i)
            const childPath = [...path, childKey]
            const child = value[i]

            matches.push(...findMatches(child, query, childPath))
        }
        return matches
    }

    for (const [key, val] of Object.entries(value)) {
        const childPath = [...path, key]

        if (key.toLowerCase().includes(q)) {
            matches.push({ path: childPath, key, type: 'key' })
        }

        matches.push(...findMatches(val, query, childPath))
    }

    return matches
}
