import React from 'react'
import ReactDOM from 'react-dom/client'
import '../src/styles/styles.css'
import { ControlsPanel } from './ControlsPanel'
import { EventsPanel } from './EventsPanel'
import { PlaygroundProvider, usePlayground } from './PlaygroundContext'
import './playground.css'
import { PreviewPanel } from './PreviewPanel'

function App() {
    const { actions } = usePlayground()

    return (
        <div className="pg">
            <header className="pg-header">
                <div className="pg-brand">
                    <div className="pg-title">react-json-treeview</div>
                    <div className="pg-subtitle">playground</div>
                </div>

                <div className="pg-header-actions">
                    <button type="button" className="pg-btn" onClick={actions.expandAll}>
                        Expand All
                    </button>
                    <button type="button" className="pg-btn" onClick={actions.collapseAll}>
                        Collapse All
                    </button>
                    <button type="button" className="pg-btn" onClick={actions.focusSearch}>
                        Focus Search
                    </button>
                    <button type="button" className="pg-btn" onClick={actions.previousMatch}>
                        Prev Match
                    </button>
                    <button type="button" className="pg-btn" onClick={actions.nextMatch}>
                        Next Match
                    </button>
                </div>
            </header>

            <div className="pg-grid">
                <ControlsPanel />
                <PreviewPanel />
                <EventsPanel />
            </div>
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <PlaygroundProvider>
            <App />
        </PlaygroundProvider>
    </React.StrictMode>
)
