import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { Breadcrumb } from '../src/Breadcrumb'

describe('<Breadcrumb />', () => {
    it('renders root and segments, and calls onCrumbClick with correct paths', () => {
        const onCrumbClick = vi.fn()
        render(<Breadcrumb path={['company', 'departments', '0']} onCrumbClick={onCrumbClick} />)

        fireEvent.click(screen.getByText('root'))
        expect(onCrumbClick).toHaveBeenCalledWith([])

        fireEvent.click(screen.getByText('company'))
        expect(onCrumbClick).toHaveBeenCalledWith(['company'])

        fireEvent.click(screen.getByText('departments'))
        expect(onCrumbClick).toHaveBeenCalledWith(['company', 'departments'])

        fireEvent.click(screen.getByText('0'))
        expect(onCrumbClick).toHaveBeenCalledWith(['company', 'departments', '0'])
    })
})
