import type { ReactNode } from 'react'

export function highlightText(text: string, query: string, isCurrent = false): ReactNode {
    const q = query.trim()
    if (!q) return text

    const lower = text.toLowerCase()
    const qLower = q.toLowerCase()
    const index = lower.indexOf(qLower)
    if (index === -1) return text

    const before = text.slice(0, index)
    const match = text.slice(index, index + q.length)
    const after = text.slice(index + q.length)

    return (
        <>
            {before}
            <mark className={`jt-mark ${isCurrent ? 'jt-mark-current' : ''}`}>{match}</mark>
            {after}
        </>
    )
}
