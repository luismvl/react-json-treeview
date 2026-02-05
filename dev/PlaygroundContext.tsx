import React, { createContext, useCallback, useContext, useMemo, useReducer, useRef } from 'react'
import type { JsonTreeViewRef, JsonValue, SearchMatch } from '../src/types'
import { buildBigData, buildDeepData, buildWideData, sampleData } from './presets'
import type { DataPreset, Theme } from './presets'
import { formatPathInput, nowId, safePreview, type LogItem } from './playgroundUtils'

export type PlaygroundState = {
    preset: DataPreset
    theme: Theme
    defaultExpanded: boolean
    searchable: boolean
    showBreadcrumb: boolean
    indentSize: number
    fontSize: number
    viewerHeight: number
    useExternalQuery: boolean
    externalQuery: string
    deepDepth: number
    wideWidth: number
    bigGroups: number
    bigItemsPerGroup: number
    jumpPathRaw: string
}

type StateAction =
    | { type: 'set'; key: keyof PlaygroundState; value: PlaygroundState[keyof PlaygroundState] }
    | { type: 'reset'; next: PlaygroundState }

function stateReducer(state: PlaygroundState, action: StateAction): PlaygroundState {
    if (action.type === 'set') {
        if (Object.is(state[action.key], action.value)) return state
        return { ...state, [action.key]: action.value } as PlaygroundState
    }
    return action.next
}

type LogAction = { type: 'push'; kind: LogItem['kind']; message: string } | { type: 'clear' }

function logReducer(state: LogItem[], action: LogAction): LogItem[] {
    if (action.type === 'push') {
        return [
            { id: nowId(), ts: Date.now(), kind: action.kind, message: action.message },
            ...state,
        ].slice(0, 200)
    }
    return []
}

type PlaygroundContextValue = {
    treeRef: React.RefObject<JsonTreeViewRef | null>

    state: PlaygroundState
    setField: <K extends keyof PlaygroundState>(key: K, value: PlaygroundState[K]) => void

    data: JsonValue
    externalSearchQuery?: string

    log: LogItem[]

    actions: {
        pushLog: (kind: LogItem['kind'], message: string) => void
        clearLog: () => void

        expandAll: () => void
        collapseAll: () => void
        nextMatch: () => void
        previousMatch: () => void

        jumpToPath: () => void
        logExpandedCount: () => void

        onNodeClick: (path: string[], value: JsonValue) => void
        onSearchChange: (q: string, matches: SearchMatch[]) => void
    }
}

const PlaygroundContext = createContext<PlaygroundContextValue | null>(null)

const defaultState: PlaygroundState = {
    preset: 'deep',
    theme: 'auto',
    defaultExpanded: true,
    searchable: true,
    showBreadcrumb: true,
    indentSize: 18,
    fontSize: 13,
    viewerHeight: 520,
    useExternalQuery: false,
    externalQuery: 'needle',
    deepDepth: 26,
    wideWidth: 120,
    bigGroups: 15,
    bigItemsPerGroup: 25,
    jumpPathRaw: 'address.city',
}

export function PlaygroundProvider({ children }: { children: React.ReactNode }) {
    const treeRef = useRef<JsonTreeViewRef | null>(null)

    const [state, dispatch] = useReducer(stateReducer, defaultState)
    const [log, dispatchLog] = useReducer(logReducer, undefined, () => [
        {
            id: nowId(),
            ts: Date.now(),
            kind: 'info',
            message:
                'Playground ready. Try searching for "needle", press Enter / Shift+Enter, and use the ref buttons.',
        } satisfies LogItem,
    ])

    const setField = useCallback(
        <K extends keyof PlaygroundState>(key: K, value: PlaygroundState[K]) => {
            dispatch({ type: 'set', key, value })
        },
        []
    )

    const pushLog = useCallback((kind: LogItem['kind'], message: string) => {
        dispatchLog({ type: 'push', kind, message })
    }, [])

    const clearLog = useCallback(() => {
        dispatchLog({ type: 'clear' })
    }, [])

    const data: JsonValue = useMemo(() => {
        if (state.preset === 'sample') return sampleData
        if (state.preset === 'deep') return buildDeepData(state.deepDepth)
        if (state.preset === 'wide') return buildWideData(state.wideWidth)
        return buildBigData(state.bigGroups, state.bigItemsPerGroup)
    }, [state.preset, state.deepDepth, state.wideWidth, state.bigGroups, state.bigItemsPerGroup])

    const externalSearchQuery = state.useExternalQuery ? state.externalQuery : undefined

    const expandAll = useCallback(() => {
        treeRef.current?.expandAll()
        pushLog('event', 'ref.expandAll()')
    }, [pushLog])

    const collapseAll = useCallback(() => {
        treeRef.current?.collapseAll()
        pushLog('event', 'ref.collapseAll()')
    }, [pushLog])

    const nextMatch = useCallback(() => {
        treeRef.current?.nextMatch()
        pushLog('event', 'ref.nextMatch()')
    }, [pushLog])

    const previousMatch = useCallback(() => {
        treeRef.current?.previousMatch()
        pushLog('event', 'ref.previousMatch()')
    }, [pushLog])

    const jumpToPath = useCallback(() => {
        const p = formatPathInput(state.jumpPathRaw)
        treeRef.current?.scrollToPath(p)
        pushLog('event', `ref.scrollToPath(${JSON.stringify(p)})`)
    }, [pushLog, state.jumpPathRaw])

    const logExpandedCount = useCallback(() => {
        const paths = Array.from(treeRef.current?.getExpandedPaths() || [])
        pushLog('info', `Expanded paths: ${paths.length}`)
    }, [pushLog])

    const onNodeClick = useCallback(
        (path: string[], value: JsonValue) => {
            pushLog('event', `onNodeClick: ${path.join('.')} = ${safePreview(value)}`)
        },
        [pushLog]
    )

    const onSearchChange = useCallback(
        (q: string, matches: SearchMatch[]) => {
            pushLog('info', `onSearchChange: "${q}" (${matches.length} matches)`)
        },
        [pushLog]
    )

    const actions = useMemo(
        () => ({
            pushLog,
            clearLog,
            expandAll,
            collapseAll,
            nextMatch,
            previousMatch,
            jumpToPath,
            logExpandedCount,
            onNodeClick,
            onSearchChange,
        }),
        [
            pushLog,
            clearLog,
            expandAll,
            collapseAll,
            nextMatch,
            previousMatch,
            jumpToPath,
            logExpandedCount,
            onNodeClick,
            onSearchChange,
        ]
    )

    const value = useMemo<PlaygroundContextValue>(
        () => ({
            treeRef,
            state,
            setField,
            data,
            externalSearchQuery,
            log,
            actions,
        }),
        [state, setField, data, externalSearchQuery, log, actions]
    )

    return <PlaygroundContext.Provider value={value}>{children}</PlaygroundContext.Provider>
}

export function usePlayground() {
    const ctx = useContext(PlaygroundContext)
    if (!ctx) throw new Error('usePlayground must be used within PlaygroundProvider')
    return ctx
}
