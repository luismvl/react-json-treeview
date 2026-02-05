export type JsonValue = JsonPrimitive | JsonObject | JsonArray
export type JsonPrimitive = string | number | boolean | null
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]

import { ReactNode } from 'react'

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
    /** External search query to control the search input */
    externalSearchQuery?: string
    /** Custom renderer for primitive values */
    renderValue?: (value: JsonPrimitive, path: string[], type: string) => ReactNode | null
}

export interface JsonTreeViewRef {
    expandAll: () => void
    collapseAll: () => void
    /** Scroll to a specific path */
    scrollToPath: (path: string[]) => void
    /** Focus the search input */
    focusSearch: () => void
    /**Get all currently expanded paths */
    getExpandedPaths: () => Set<string>
    /** Jump to next search match (if any) */
    nextMatch: () => void
    /** Jump to previous search match (if any) */
    previousMatch: () => void
}

export interface SearchMatch {
    /** Path to the match, e.g. ['address', 'city'] */
    path: string[]
    /** The matching key */
    key: string
    /** The matching value (if value matched) */
    value?: string
    /** Whether key or value matched */
    type: 'key' | 'value'
}
