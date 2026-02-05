import React from 'react'
import { formatTime, type LogItem } from './playgroundUtils'

type Props = {
    log: LogItem[]
    onClear: () => void
}

export function EventsPanel({ log, onClear }: Props) {
    return (
        <section className="pg-panel pg-log">
            <div className="pg-panel-title">Events</div>
            <div className="pg-log-actions">
                <button type="button" className="pg-btn pg-btn-secondary" onClick={onClear}>
                    Clear
                </button>
            </div>
            <div className="pg-log-list">
                {log.length === 0 ? (
                    <div className="pg-hint">No events yet.</div>
                ) : (
                    log.map((item) => (
                        <div key={item.id} className={`pg-log-item pg-log-${item.kind}`}>
                            <span className="pg-log-ts">{formatTime(item.ts)}</span>
                            <span className="pg-log-msg">{item.message}</span>
                        </div>
                    ))
                )}
            </div>
            <div className="pg-shortcuts">
                <div className="pg-panel-title pg-panel-title-sub">Shortcuts</div>
                <div className="pg-shortcut-row">
                    <code>Ctrl/Cmd+F</code>
                    <span>Focus search</span>
                </div>
                <div className="pg-shortcut-row">
                    <code>Enter</code>
                    <span>Toggle expand / next match (in search)</span>
                </div>
                <div className="pg-shortcut-row">
                    <code>Shift+Enter</code>
                    <span>Previous match (in search)</span>
                </div>
                <div className="pg-shortcut-row">
                    <code>Escape</code>
                    <span>Clear search</span>
                </div>
                <div className="pg-shortcut-row">
                    <code>↑ / ↓</code>
                    <span>Move focus</span>
                </div>
                <div className="pg-shortcut-row">
                    <code>← / →</code>
                    <span>Collapse / expand</span>
                </div>
                <div className="pg-shortcut-row">
                    <code>Home / End</code>
                    <span>First / last</span>
                </div>
            </div>
        </section>
    )
}
