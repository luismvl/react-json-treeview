export type LogItem = { id: string; ts: number; kind: 'info' | 'event' | 'warn'; message: string }

export function nowId() {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export function formatTime(ts: number) {
    const d = new Date(ts)
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
}

export function safePreview(value: unknown) {
    try {
        if (typeof value === 'string') {
            return JSON.stringify(value.length > 120 ? `${value.slice(0, 120)}…` : value)
        }
        if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
            return String(value)
        }
        if (Array.isArray(value)) return `[Array(${value.length})]`
        if (typeof value === 'object') return '{Object}'
        return String(value)
    } catch {
        return '[unserializable]'
    }
}

export function formatPathInput(raw: string): string[] {
    const s = raw.trim()
    if (!s) return []
    return s
        .split('.')
        .map((p) => p.trim())
        .filter(Boolean)
}
