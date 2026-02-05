import type { JsonValue } from './types'

/**
 * Recursively get all expandable paths in the JSON data
 * @param value The JSON value
 * @param currentPath The current path (used in recursion)
 * @returns A set of expandable paths
 */
export function getAllExpandablePaths(value: JsonValue, currentPath: string[] = []): Set<string> {
    const paths = new Set<string>()

    if (value !== null && typeof value === 'object') {
        const entries = Array.isArray(value)
            ? value.map((v, i) => [String(i), v] as const)
            : Object.entries(value)

        const pathKey = currentPath.join('.')
        if (entries.length > 0) paths.add(pathKey)

        for (const [key, val] of entries) {
            const childPaths = getAllExpandablePaths(val, [...currentPath, key])
            childPaths.forEach((p) => paths.add(p))
        }
    }

    return paths
}
