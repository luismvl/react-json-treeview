import { useMemo } from 'react'

export function useResolvedFocusedKey(
    focusedPathKey: string,
    visibleKeys: Set<string>,
    visibleNodes: Array<{ pathKey: string }>
) {
    return useMemo(() => {
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
}
