import { describe, expect, it } from 'vitest'
import { getAllExpandablePaths } from '../src/getAllExpandablePaths'
import type { JsonValue } from '../src/types'

describe('getAllExpandablePaths', () => {
    it('returns empty set for primitives', () => {
        expect(getAllExpandablePaths('x')).toEqual(new Set())
        expect(getAllExpandablePaths(123)).toEqual(new Set())
        expect(getAllExpandablePaths(true)).toEqual(new Set())
        expect(getAllExpandablePaths(null)).toEqual(new Set())
    })

    it('includes expandable object/array paths', () => {
        const data: JsonValue = {
            a: { b: { c: 1 } },
            arr: [{ x: 1 }, 2, []],
            emptyObj: {},
            emptyArr: [],
        }

        const paths = getAllExpandablePaths(data)

        expect(paths.has('')).toBe(true)
        expect(paths.has('a')).toBe(true)
        expect(paths.has('a.b')).toBe(true)
        expect(paths.has('arr')).toBe(true)
        expect(paths.has('arr.0')).toBe(true)
        expect(paths.has('arr.2')).toBe(false) // empty array is not expandable
        expect(paths.has('emptyObj')).toBe(false)
        expect(paths.has('emptyArr')).toBe(false)
    })
})

