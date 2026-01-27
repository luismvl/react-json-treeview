import { JsonValue } from './types'

interface TreeNodeProps {
    value: JsonValue
    path: string[]
    keyName?: string
    expandedPaths: Set<string>
    onToggle: (path: string) => void
    indentSize: number
}

export function TreeNode({
    value,
    path,
    keyName,
    expandedPaths,
    onToggle,
    indentSize,
}: TreeNodeProps) {
    const pathKey = path.join('.')
    const isExpanded = expandedPaths.has(pathKey) || path.length == 0
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
            >
                {keyName !== undefined && <span className="jt-key">{keyName}:</span>}
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
                onClick={() => onToggle(pathKey)}
            >
                <span className="jt-toggle">{isEmpty ? ' ' : isExpanded ? '▼' : '▶'}</span>
                {keyName !== undefined && <span className="jt-key"> {keyName}: </span>}
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
                        />
                    ))}
                </>
            )}
            <div style={{ paddingLeft: depth * indentSize }}>
                <span className="jt-bracket">{isArray ? ']' : '}'}</span>
            </div>
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
