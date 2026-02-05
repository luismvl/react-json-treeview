import { ReactNode } from 'react'

/** Any valid JSON value. */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

/** JSON primitive types. */
export type JsonPrimitive = string | number | boolean | null

/** Helper type for primitive type names (used by `renderValue`). */
export type JsonPrimitiveType = 'string' | 'number' | 'boolean' | 'null'

export interface RenderValueContext {
    /** Built-in primitive renderer (preserves current internal behavior like highlighting). */
    defaultRenderer: () => ReactNode
    /** Active search query used by the component. */
    searchQuery: string
    /** Whether this value cell is the currently selected value match. */
    isCurrentValueMatch: boolean
    /** Dot-joined path, e.g. `address.city`. */
    pathKey: string
}

/**
 * Custom primitive renderer used by `renderValue`.
 */
export type RenderValueFn = (
    value: JsonPrimitive,
    path: string[],
    type: JsonPrimitiveType,
    ctx: RenderValueContext
) => ReactNode | null

/** A JSON object (`{}`) where values are also JSON. */
export type JsonObject = { [key: string]: JsonValue }

/** A JSON array (`[]`) where values are also JSON. */
export type JsonArray = JsonValue[]

export interface JsonTreeViewProps {
    /** The JSON data to render */
    data: JsonValue
    /** Whether nodes start expanded (default: true) */
    defaultExpanded?: boolean
    /** Color theme (default: 'auto') */
    theme?: 'light' | 'dark' | 'auto'
    /** Additional CSS class */
    className?: string
    /** Show search bar (default: true) */
    searchable?: boolean
    /** Show sticky breadcrumb (default: true) */
    showBreadcrumb?: boolean
    /** Pixels per indent level (default: 20) */
    indentSize?: number
    /** Font size in pixels (default: 13) */
    fontSize?: number
    /** Callback when a node is clicked */
    onNodeClick?: (path: string[], value: JsonValue) => void
    /** Callback when the search query or matches change */
    onSearchChange?: (query: string, matches: SearchMatch[]) => void
    /**
     * Controlled search query.
     *
     * Notes:
     * - When set, the built-in search input becomes read-only (and navigation uses this query).
     * - Search behavior still applies even when `searchable={false}` (matches highlight + ref navigation).
     */
    externalSearchQuery?: string
    /**
     * Custom renderer for primitive leaf values.
     *
     * Return `null` to fall back to the default rendering (including search highlighting).
     * The `ctx` argument is always provided by the component.
     */
    renderValue?: RenderValueFn
}

export interface JsonTreeViewRef {
    /** Expand all non-empty objects/arrays. */
    expandAll: () => void
    /** Collapse all nodes except the root level. */
    collapseAll: () => void
    /** Scroll to a specific path (parents are auto-expanded). */
    scrollToPath: (path: string[]) => void
    /** Focus the search input (no-op if `searchable={false}`). */
    focusSearch: () => void
    /** Get a snapshot of currently expanded path keys. */
    getExpandedPaths: () => Set<string>
    /** Jump to next search match (if any) */
    nextMatch: () => void
    /** Jump to previous search match (if any) */
    previousMatch: () => void
}

export interface SearchMatch {
    /** Path to the match, e.g. `['address', 'city']` (array indices are strings). */
    path: string[]
    /** The matching key */
    key: string
    /** The matching value (when `type === 'value'`). */
    value?: string
    /** Whether the match was on the key or the value. */
    type: 'key' | 'value'
}
