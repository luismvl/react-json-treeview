import { useCallback, useEffect, useRef, useState } from 'react'

type ThrottleState = {
    lastUpdateTs: number
    pendingKey: string | null
    timeoutId: number | null
}

export function useBreadcrumbObserver(
    scrollContainerRef: React.RefObject<HTMLElement | null>,
    enabled: boolean,
    observeKey?: unknown
) {
    const [visiblePath, setVisiblePath] = useState<string[]>([])
    const observerStateRef = useRef<Map<string, number> | null>(null)
    const throttleRef = useRef<ThrottleState>({
        lastUpdateTs: 0,
        pendingKey: null,
        timeoutId: null,
    })

    const scheduleUpdate = useCallback((pathKey: string) => {
        const state = throttleRef.current
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
        if (!enabled) return
        const scrollRoot = scrollContainerRef.current
        if (!scrollRoot) return

        const ioRoot: Element | null =
            scrollRoot.scrollHeight > scrollRoot.clientHeight ? scrollRoot : null

        const observer = new IntersectionObserver(
            (entries) => {
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

                if (bestKey !== null) scheduleUpdate(bestKey)
            },
            {
                root: ioRoot,
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
    }, [enabled, observeKey, scheduleUpdate, scrollContainerRef])

    useEffect(() => {
        const state = throttleRef.current
        return () => {
            if (state.timeoutId !== null) {
                window.clearTimeout(state.timeoutId)
                state.timeoutId = null
            }
        }
    }, [])

    return visiblePath
}
