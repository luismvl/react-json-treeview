import React from 'react'
import ReactDOM from 'react-dom/client'
import { JsonTreeView } from '../src/JsonTreeView'
import '../src/styles/styles.css'

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
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
