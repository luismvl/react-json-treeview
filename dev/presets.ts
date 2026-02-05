import type { JsonValue } from '../src/types'

export type Theme = 'light' | 'dark' | 'auto'
export type DataPreset = 'sample' | 'deep' | 'wide' | 'big'

export const sampleData: JsonValue = {
    name: 'John',
    age: 30,
    address: {
        city: 'New York',
        zip: '10001',
    },
    hobbies: ['reading', 'coding'],
    emptyArr: [],
    flags: { isActive: true, isBeta: false, isNull: null },
}

export function buildDeepData(depth: number): JsonValue {
    let node: JsonValue = {
        leaf: 'needle in a haystack',
        ok: true,
        n: 42,
        nil: null,
    }
    for (let i = depth; i >= 1; i--) {
        node = { [`level_${i}`]: node, tag: i % 3 === 0 ? 'needle' : 'misc' } as JsonValue
    }
    return node
}

export function buildWideData(width: number): JsonValue {
    const out: Record<string, JsonValue> = { meta: { width } }
    for (let i = 0; i < width; i++) {
        out[`key_${String(i).padStart(3, '0')}`] = i % 7 === 0 ? 'needle' : `value_${i}`
    }
    out.nested = {
        a: { b: { c: 'needle' } },
        flags: { t: true, f: false, n: null },
    }
    return out
}

export function buildBigData(groups: number, itemsPerGroup: number): JsonValue {
    const out: Record<string, JsonValue> = { generated: true, groups }
    for (let g = 0; g < groups; g++) {
        const group: Record<string, JsonValue> = {
            id: g,
            label: g % 5 === 0 ? 'needle' : 'group',
        }
        const items: JsonValue[] = []
        for (let i = 0; i < itemsPerGroup; i++) {
            items.push({
                id: `${g}-${i}`,
                name: i % 17 === 0 ? 'needle item' : `item_${i}`,
                enabled: i % 2 === 0,
                score: (g + 1) * (i + 1),
            } satisfies JsonValue)
        }
        group.items = items
        out[`group_${g}`] = group
    }
    return out
}
