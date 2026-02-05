import type { ReactNode } from 'react'
import { highlightText } from './highlightText'
import type { JsonValue, SearchMatch } from './types'

interface TreeNodeProps {
    value: JsonValue
    path: string[]
    keyName?: string
    expandedPaths: Set<string>
    onToggle: (path: string) => void
    indentSize: number
    onNodeClick?: (path: string[], value: JsonValue) => void
    searchQuery?: string
    currentMatch?: SearchMatch | null
    focusedPathKey?: string
}

export function TreeNode({
    value,
    path,
    keyName,
    expandedPaths,
    onToggle,
    indentSize,
    onNodeClick,
    searchQuery = '',
    currentMatch = null,
    focusedPathKey = '',
}: TreeNodeProps) {
    const pathKey = path.join('.')
    const isExpanded = expandedPaths.has(pathKey)
    const isExpandable =
        value !== null && typeof value == 'object' && Object.entries(value).length > 0
    const depth = path.length
    const currentMatchPathKey = currentMatch?.path.join('.') ?? null
    const isCurrentRow = currentMatchPathKey === pathKey
    const isFocusedRow = focusedPathKey === pathKey

    // Render primtive values
    if (!isExpandable) {
        const isCurrentValue = isCurrentRow && currentMatch?.type === 'value'
        const isCurrentKey = isCurrentRow && currentMatch?.type === 'key'
        return (
            <div
                className={`jt-row jt-node jt-leaf ${isCurrentRow ? 'jt-row-current' : ''} ${
                    isFocusedRow ? 'jt-row-focused' : ''
                }`}
                data-path={pathKey}
                data-expandable="0"
                role="treeitem"
                aria-level={depth + 1}
                aria-selected={isFocusedRow}
                tabIndex={isFocusedRow ? 0 : -1}
                style={{
                    paddingLeft: depth * indentSize,
                }}
                onClick={() => onNodeClick?.(path, value)}
            >
                {keyName !== undefined && (
                    <span className="jt-key">
                        {highlightText(keyName, searchQuery, isCurrentKey)}:{' '}
                    </span>
                )}
                <span className={`jt-value jt-${getValueType(value)}`}>
                    {renderPrimitiveValue(value, searchQuery, isCurrentValue)}
                </span>
            </div>
        )
    }

    const isArray = Array.isArray(value)
    const entries = isArray ? value.map((v, i) => [String(i), v] as const) : Object.entries(value)
    const isEmpty = entries.length === 0

    return (
        <div className="jt-node jt-branch">
            <div
                className={`jt-row ${isCurrentRow ? 'jt-row-current' : ''} ${
                    isFocusedRow ? 'jt-row-focused' : ''
                }`}
                data-path={pathKey}
                data-expandable={isEmpty ? '0' : '1'}
                data-expanded={isExpanded ? '1' : '0'}
                role="treeitem"
                aria-level={depth + 1}
                aria-expanded={!isEmpty ? isExpanded : undefined}
                aria-selected={isFocusedRow}
                tabIndex={isFocusedRow ? 0 : -1}
                style={{ paddingLeft: depth * indentSize || 4 }}
                onClick={() => {
                    onToggle(pathKey)
                    onNodeClick?.(path, value)
                }}
            >
                <span className="jt-toggle">{isEmpty ? ' ' : isExpanded ? '▼' : '▶'}</span>
                {keyName !== undefined && (
                    <span className="jt-key">
                        {highlightText(
                            keyName,
                            searchQuery,
                            isCurrentRow && currentMatch?.type === 'key'
                        )}
                        :{' '}
                    </span>
                )}

                <span className="jt-bracket">{isArray ? '[' : '{'}</span>
                {!isExpanded && <span className="jt-collapse-indicator">...</span>}
                {!isExpanded && <span className="jt-bracket">{isArray ? ']' : '}'}</span>}
            </div>
            {isExpanded && (
                <>
                    {entries.map(([key, val]) => (
                        <TreeNode
                            key={key}
                            value={val}
                            path={[...path, key]}
                            keyName={isArray ? undefined : key}
                            expandedPaths={expandedPaths}
                            onToggle={onToggle}
                            indentSize={indentSize}
                            onNodeClick={onNodeClick}
                            searchQuery={searchQuery}
                            currentMatch={currentMatch}
                            focusedPathKey={focusedPathKey}
                        />
                    ))}
                </>
            )}
            {isExpanded && (
                <div style={{ paddingLeft: depth * indentSize }}>
                    <span className="jt-bracket">{isArray ? ']' : '}'}</span>
                </div>
            )}
        </div>
    )
}

function getValueType(value: JsonValue): string {
    if (value === null) return 'null'
    return typeof value
}

function renderPrimitiveValue(value: JsonValue, query: string, isCurrent: boolean): ReactNode {
    if (value === null) return highlightText('null', query, isCurrent)
    if (typeof value === 'string') {
        return (
            <>
                {'"'}
                {highlightText(value, query, isCurrent)}
                {'"'}
            </>
        )
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return highlightText(String(value), query, isCurrent)
    }
    if (typeof value === 'object' && Array.isArray(value)) return '[]'
    if (typeof value === 'object') return '{}'
    return String(value)
}
