import { forwardRef } from 'react'
import type { KeyboardEvent } from 'react'

interface SearchBarProps {
    query: string
    onQueryChange: (next: string) => void
    total: number
    currentIndex: number
    onNext: () => void
    onPrevious: () => void
    disabled?: boolean
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
    { query, onQueryChange, total, currentIndex, onNext, onPrevious, disabled = false },
    ref
) {
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            if (e.shiftKey) onPrevious()
            else onNext()
        } else if (e.key === 'Escape') {
            e.preventDefault()
            onQueryChange('')
        }
    }

    const counterText = `${currentIndex >= 0 ? currentIndex + 1 : 0} of ${total}`

    return (
        <div className="jt-search">
            <input
                ref={ref}
                type="text"
                placeholder="Search..."
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled}
            />
            <span className="jt-search-counter" aria-live="polite">
                {counterText}
            </span>
            <button
                type="button"
                className="jt-search-btn"
                onClick={onPrevious}
                disabled={total === 0}
                aria-label="Previous match"
                title="Previous (Shift+Enter)"
            >
                ↑
            </button>
            <button
                type="button"
                className="jt-search-btn"
                onClick={onNext}
                disabled={total === 0}
                aria-label="Next match"
                title="Next (Enter)"
            >
                ↓
            </button>
        </div>
    )
})

SearchBar.displayName = 'SearchBar'
