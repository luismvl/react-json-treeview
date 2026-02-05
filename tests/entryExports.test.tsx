import React from 'react'
import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { highlightText } from '../src/entry'

describe('package entry exports', () => {
    it('exports highlightText', () => {
        const { container } = render(<div>{highlightText('needle', 'nee')}</div>)
        const mark = container.querySelector('mark.jt-mark')
        expect(mark).toBeTruthy()
        expect(mark?.textContent).toBe('nee')
    })
})

