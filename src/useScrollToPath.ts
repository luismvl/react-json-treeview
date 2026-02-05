import { useCallback } from 'react'

export function useScrollToPath(
    scrollContainerRef: React.RefObject<HTMLElement | null>,
    setExpandedPaths: React.Dispatch<React.SetStateAction<Set<string>>>
) {
    return useCallback(
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
                ancestorPaths.add(path.slice(0, i).join('.'))
            }

            setExpandedPaths((prev) => new Set([...prev, ...ancestorPaths]))

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
        [scrollContainerRef, setExpandedPaths]
    )
}
