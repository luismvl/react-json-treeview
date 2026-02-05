import React, { createRef } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { act } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { JsonTreeView } from '../src/JsonTreeView'
import type { JsonTreeViewRef, JsonValue, RenderValueFn } from '../src/types'

describe('<JsonTreeView />', () => {
    it('renders primitive root values', () => {
        const { rerender } = render(<JsonTreeView data="hello" showBreadcrumb={false} />)
        expect(screen.getByText('"hello"')).toBeInTheDocument()

        rerender(<JsonTreeView data={42} showBreadcrumb={false} />)
        expect(screen.getByText('42')).toBeInTheDocument()

        rerender(<JsonTreeView data={true} showBreadcrumb={false} />)
        expect(screen.getByText('true')).toBeInTheDocument()

        rerender(<JsonTreeView data={null} showBreadcrumb={false} />)
        expect(screen.getByText('null')).toBeInTheDocument()
    })

    it('respects defaultExpanded=false for object root', () => {
        const data: JsonValue = { a: { b: 1 } }
        render(<JsonTreeView data={data} defaultExpanded={false} showBreadcrumb={false} />)

        // Root row is visible (with "{"), nested leaf should not be rendered initially.
        expect(screen.queryByText('b:')).not.toBeInTheDocument()
    })

    it('toggles expand/collapse on row click', () => {
        const data: JsonValue = { a: { b: 1 } }
        render(<JsonTreeView data={data} defaultExpanded={false} showBreadcrumb={false} />)

        fireEvent.click(screen.getByText('a:'))

        expect(screen.getByText('b:')).toBeInTheDocument()
    })

    it('fires onNodeClick with path and value', () => {
        const data: JsonValue = { a: { b: 1 } }
        const onNodeClick = vi.fn()
        render(
            <JsonTreeView
                data={data}
                defaultExpanded
                showBreadcrumb={false}
                onNodeClick={onNodeClick}
            />
        )

        fireEvent.click(screen.getByText('b:'))
        expect(onNodeClick).toHaveBeenCalled()

        const lastCall = onNodeClick.mock.calls[onNodeClick.mock.calls.length - 1] as [
            string[],
            JsonValue,
        ]
        const [path, value] = lastCall
        expect(path.join('.')).toBe('a.b')
        expect(value).toBe(1)
    })

    it('supports renderValue for primitive leaves', () => {
        const data: JsonValue = { a: 1, b: 'x', c: null }
        const renderValue = vi.fn((value, path, type) => {
            if (type === 'number') return <span>NUM</span>
            if (type === 'string') return <span>{`${path.join('.')}:${String(value)}`}</span>
            return null
        })

        render(
            <JsonTreeView
                data={data}
                defaultExpanded
                showBreadcrumb={false}
                renderValue={renderValue}
            />
        )

        expect(screen.getByText('NUM')).toBeInTheDocument()
        expect(screen.getByText('b:x')).toBeInTheDocument()
        // null falls back to default rendering when renderValue returns null
        expect(screen.getByText('null')).toBeInTheDocument()
        expect(renderValue).toHaveBeenCalled()
    })

    it('provides renderValue context and defaultRenderer', () => {
        const data: JsonValue = { a: 'needle', b: 'x' }
        const renderValue = vi.fn<RenderValueFn>((_value, _path, _type, ctx) => {
            return <span data-testid={`wrap-${ctx.pathKey}`}>{ctx.defaultRenderer()}</span>
        })

        render(
            <JsonTreeView
                data={data}
                defaultExpanded
                showBreadcrumb={false}
                externalSearchQuery="needle"
                renderValue={renderValue}
            />
        )

        const callForA = renderValue.mock.calls.find((args) => args[1].join('.') === 'a')
        expect(callForA).toBeTruthy()
        if (!callForA) return

        const ctx = callForA[3]
        expect(ctx.pathKey).toBe('a')
        expect(ctx.searchQuery).toBe('needle')
        expect(ctx.isCurrentValueMatch).toBe(false)
        expect(typeof ctx.defaultRenderer).toBe('function')

        expect(screen.getByTestId('wrap-a').querySelector('mark.jt-mark')).toBeTruthy()
    })

    it('search highlights matches and Escape clears (uncontrolled)', () => {
        const data: JsonValue = { city: 'New York' }
        const { container } = render(<JsonTreeView data={data} showBreadcrumb={false} />)

        const input = screen.getByPlaceholderText('Search...')
        fireEvent.change(input, { target: { value: 'new' } })

        expect(container.querySelector('mark.jt-mark')).toBeTruthy()

        fireEvent.keyDown(input, { key: 'Escape' })
        expect((input as HTMLInputElement).value).toBe('')
    })

    it('Enter / Shift+Enter navigates between search matches', () => {
        const data: JsonValue = { a: 'needle', b: 'needle' }
        const { container } = render(<JsonTreeView data={data} showBreadcrumb={false} />)

        const input = screen.getByPlaceholderText('Search...')
        fireEvent.change(input, { target: { value: 'needle' } })

        fireEvent.keyDown(input, { key: 'Enter' })
        const first = container.querySelector('.jt-row-current') as HTMLElement | null
        expect(first).toBeTruthy()

        fireEvent.keyDown(input, { key: 'Enter' })
        const second = container.querySelector('.jt-row-current') as HTMLElement | null
        expect(second).toBeTruthy()
        expect(second?.getAttribute('data-path')).not.toBe(first?.getAttribute('data-path'))

        fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
        const back = container.querySelector('.jt-row-current') as HTMLElement | null
        expect(back?.getAttribute('data-path')).toBe(first?.getAttribute('data-path'))
    })

    it('ref methods expandAll/collapseAll/getExpandedPaths work', async () => {
        const ref = createRef<JsonTreeViewRef>()
        const data: JsonValue = { a: { b: 1 } }
        render(
            <JsonTreeView ref={ref} data={data} defaultExpanded={false} showBreadcrumb={false} />
        )

        expect(ref.current).toBeTruthy()
        act(() => {
            ref.current?.expandAll()
        })
        await waitFor(() => expect(screen.getByText('b:')).toBeInTheDocument())

        const expandedAfterExpand = ref.current?.getExpandedPaths()
        expect(expandedAfterExpand?.has('a')).toBe(true)

        act(() => {
            ref.current?.collapseAll()
        })
        await waitFor(() => expect(screen.queryByText('b:')).not.toBeInTheDocument())
    })

    it('ref methods nextMatch/previousMatch work with externalSearchQuery', () => {
        const ref = createRef<JsonTreeViewRef>()
        const data: JsonValue = { a: 'needle', b: 'needle' }
        const { container } = render(
            <JsonTreeView
                ref={ref}
                data={data}
                showBreadcrumb={false}
                externalSearchQuery="needle"
            />
        )

        expect(container.querySelector('.jt-row-current')).toBeNull()
        act(() => {
            ref.current?.nextMatch()
        })
        const first = container.querySelector('.jt-row-current') as HTMLElement | null
        expect(first).toBeTruthy()

        act(() => {
            ref.current?.nextMatch()
        })
        const second = container.querySelector('.jt-row-current') as HTMLElement | null
        expect(second).toBeTruthy()
        expect(second?.getAttribute('data-path')).not.toBe(first?.getAttribute('data-path'))

        act(() => {
            ref.current?.previousMatch()
        })
        const back = container.querySelector('.jt-row-current') as HTMLElement | null
        expect(back?.getAttribute('data-path')).toBe(first?.getAttribute('data-path'))
    })

    it('supports keyboard navigation and Ctrl/Cmd+F (scoped)', () => {
        const data: JsonValue = { a: { b: 1 }, c: 2 }
        render(<JsonTreeView data={data} defaultExpanded showBreadcrumb={false} />)

        const tree = screen.getByRole('tree')
        const search = screen.getByPlaceholderText('Search...') as HTMLInputElement

        const items = screen.getAllByRole('treeitem')
        // Root is tabbable by default.
        expect(items[0]).toHaveAttribute('tabindex', '0')

        items[0].focus()
        fireEvent.keyDown(tree, { key: 'ArrowDown' })

        const afterDown = screen.getAllByRole('treeitem')
        expect(afterDown[1]).toHaveAttribute('tabindex', '0')
        expect(afterDown[1]).toHaveAttribute('aria-selected', 'true')

        // Ctrl/Cmd+F focuses search when initiated inside the component.
        fireEvent.keyDown(afterDown[1], { key: 'f', ctrlKey: true })
        expect(search).toHaveFocus()
    })

    it('ArrowRight expands collapsed node, ArrowLeft collapses expanded node', async () => {
        const data: JsonValue = { a: { b: 1 } }
        render(<JsonTreeView data={data} defaultExpanded={false} showBreadcrumb={false} />)

        const tree = screen.getByRole('tree')

        // Focus the "a" row (it exists even when collapsed).
        const aRow = screen.getByText('a:').closest('.jt-row') as HTMLElement
        act(() => {
            aRow.focus()
            fireEvent.focus(aRow)
        })

        expect(screen.queryByText('b:')).not.toBeInTheDocument()
        act(() => {
            fireEvent.keyDown(tree, { key: 'ArrowRight' })
        })
        await waitFor(() => expect(screen.getByText('b:')).toBeInTheDocument())

        act(() => {
            fireEvent.keyDown(tree, { key: 'ArrowLeft' })
        })
        await waitFor(() => expect(screen.queryByText('b:')).not.toBeInTheDocument())
    })
})
