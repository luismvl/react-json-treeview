import { JsonValue } from './types'

interface TreeNodeProps {
    value: JsonValue
    path: string[]
    keyName?: string
    expandedPaths: Set<string>
    onToggle: (path: string) => void
    indentSize: number
    onNodeClick?: (path: string[], value: JsonValue) => void
}

export function TreeNode({
    value,
    path,
    keyName,
    expandedPaths,
    onToggle,
    indentSize,
    onNodeClick,
}: TreeNodeProps) {
    const pathKey = path.join('.')
    const isExpanded = expandedPaths.has(pathKey)
    const isExpandable =
        value !== null && typeof value == 'object' && Object.entries(value).length > 0
    const depth = path.length

    // Render primtive values
    if (!isExpandable) {
        return (
            <div
                className="jt-node jt-leaf"
                style={{
                    paddingLeft: depth * indentSize,
                }}
                onClick={() => onNodeClick?.(path, value)}
            >
                {keyName !== undefined && <span className="jt-key">{keyName}: </span>}
                <span className={`jt-value jt-${getValueType(value)}`}>{formatValue(value)}</span>
            </div>
        )
    }

    const isArray = Array.isArray(value)
    const entries = isArray ? value.map((v, i) => [String(i), v] as const) : Object.entries(value)
    const isEmpty = entries.length === 0

    return (
        <div className="jt-node jt-branch">
            <div
                className="jt-row"
                style={{ paddingLeft: depth * indentSize }}
                onClick={() => {
                    onToggle(pathKey)
                    onNodeClick?.(path, value)
                }}
            >
                <span className="jt-toggle">{isEmpty ? ' ' : isExpanded ? '▼' : '▶'}</span>
                {keyName !== undefined && <span className="jt-key">{keyName}: </span>}

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

function formatValue(value: JsonValue): string {
    if (value === null) return 'null'
    if (typeof value === 'object' && Array.isArray(value)) return '[]'
    if (typeof value === 'object') return '{}'
    if (typeof value === 'string') return `"${value}"`
    return String(value)
}
