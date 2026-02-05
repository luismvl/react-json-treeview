import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// jsdom doesn't implement layout/scrolling; we just need these to not throw.
Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    writable: true,
})

Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    value: vi.fn(),
    writable: true,
})

// Minimal IntersectionObserver mock for breadcrumb logic.
class MockIntersectionObserver implements IntersectionObserver {
    readonly root: Element | Document | null
    readonly rootMargin: string
    readonly scrollMargin: string
    readonly thresholds: ReadonlyArray<number>

    constructor(_callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        this.root = options?.root ?? null
        this.rootMargin = options?.rootMargin ?? ''
        // Newer DOM libs include `scrollMargin` (currently not used by the component).
        const opt = options as (IntersectionObserverInit & { scrollMargin?: string }) | undefined
        this.scrollMargin = opt?.scrollMargin ?? ''
        const t = options?.threshold ?? 0
        this.thresholds = Array.isArray(t) ? t : [t]
    }

    disconnect() {}
    observe() {}
    unobserve() {}
    takeRecords(): IntersectionObserverEntry[] {
        return []
    }
}

// Replace the global IntersectionObserver with our mock for testing
globalThis.IntersectionObserver = MockIntersectionObserver as typeof IntersectionObserver
