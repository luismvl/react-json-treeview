import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { JsonTreeView } from '../src/JsonTreeView'
import '../src/styles/styles.css'
import { JsonTreeViewRef } from '../src/types'

const sampleData = {
    name: 'John',
    age: 30,
    address: {
        city: 'New York',
        zip: '10001',
    },
    hobbies: ['reading', 'coding'],
    emptyArr: [],
}

function App() {
    const treeRef = useRef<JsonTreeViewRef>(null)

    return (
        <div style={{ padding: 20, backgroundColor: '#282c34', color: 'white' }}>
            <h1>JSON Tree Viewer - Dev</h1>

            <h2>Default (with search and breadcrumb placeholders)</h2>
            <JsonTreeView
                data={sampleData}
                onNodeClick={(path, value) => {
                    console.log('Clicked:', path.join('.'), value)
                }}
            />

            <h2>Dark Theme, No Search, No Breadcrumb</h2>
            <JsonTreeView
                data={sampleData}
                theme="dark"
                searchable={false}
                showBreadcrumb={false}
            />

            <h2>Collapsed by Default</h2>
            <JsonTreeView data={sampleData} defaultExpanded={false} />

            <h2>Phase 8: Imperative API Tests</h2>
            <div
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 8,
                }}
            >
                <button onClick={() => treeRef.current?.expandAll()}>Expand All</button>
                <button onClick={() => treeRef.current?.collapseAll()}>Collapse All</button>
                <button onClick={() => treeRef.current?.scrollToPath(['address', 'city'])}>
                    Scroll to Address.City
                </button>
                <button onClick={() => treeRef.current?.scrollToPath(['hobbies', '1'])}>
                    Scroll to Hobbies[1]
                </button>
                <button onClick={() => treeRef.current?.focusSearch()}>Focus Search</button>
                <button
                    onClick={() => {
                        const paths = treeRef.current?.getExpandedPaths()
                        console.log('Expanded paths:', Array.from(paths || []))
                    }}
                >
                    Log Expanded Paths
                </button>
            </div>
            <JsonTreeView data={sampleData} ref={treeRef} />
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
