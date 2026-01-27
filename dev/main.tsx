import React from 'react'
import ReactDOM from 'react-dom/client'
import { JsonTreeView } from '../src/JsonTreeView'

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
        <div style={{ padding: 20 }}>
            <h1>JSON Tree Viewer - Dev</h1>
            <JsonTreeView data={sampleData} defaultExpanded />
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
