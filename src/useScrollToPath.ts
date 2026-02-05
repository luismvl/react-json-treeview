import { useCallback } from 'react'

function scrollElementIntoContainer(
    container: HTMLElement,
    element: HTMLElement,
    align: ScrollLogicalPosition
) {
    const containerRect = container.getBoundingClientRect()
    const elementRect = element.getBoundingClientRect()
    const relativeTop = elementRect.top - containerRect.top + container.scrollTop

    let targetScroll: number
    if (align === 'start') {
        targetScroll = relativeTop
    } else if (align === 'end') {
        targetScroll = relativeTop - containerRect.height + elementRect.height
    } else {
        targetScroll = relativeTop - containerRect.height / 2 + elementRect.height / 2
    }

    container.scrollTo({ top: targetScroll, behavior: 'smooth' })
}

export function useScrollToPath(
    scrollContainerRef: React.RefObject<HTMLElement | null>,
    setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>
) {
    return useCallback(
        (path: string[], opts?: { align?: ScrollLogicalPosition }) => {
            const align: ScrollLogicalPosition = opts?.align ?? 'center'
            const container = scrollContainerRef.current
            if (!container) return

            if (path.length === 0) {
                container.scrollTo({ top: 0, behavior: 'smooth' })
                return
            }

            const ancestorPaths = new Set<string>()
            for (let i = 1; i <= path.length; i++) {
                ancestorPaths.add(path.slice(0, i).join('.'))
            }

            setExpandedPaths((prev) => new Set([...prev, ...ancestorPaths]))

            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const pathKey = path.join('.')
                    const row =
                        container.querySelector<HTMLElement>(`.jt-row[data-path="${pathKey}"]`) ??
                        container.querySelector<HTMLElement>(`[data-path="${pathKey}"]`)
                    if (row) scrollElementIntoContainer(container, row, align)
                })
            })
        },
        [scrollContainerRef, setExpandedPaths]
    )
}
