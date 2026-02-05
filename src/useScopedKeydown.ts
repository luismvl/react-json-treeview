import { useEffect } from 'react'

export function useScopedKeydown(
    rootRef: React.RefObject<HTMLElement | null>,
    handler: (e: KeyboardEvent) => void
) {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            const root = rootRef.current
            if (!root) return
            const target = e.target as Node | null
            if (target && !root.contains(target)) return
            handler(e)
        }

        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [rootRef, handler])
}
