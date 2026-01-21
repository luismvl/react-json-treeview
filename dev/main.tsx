import React from 'react'
import ReactDOM from 'react-dom/client'

const sampleData = {
    name: 'John',
    age: 30,
    address: {
        city: 'New York',
        zip: '10001',
    },
    hobbies: ['reading', 'coding'],
}

function App() {
    return (
        <div>
            <h1>JSON Tree Viewer</h1>
            <pre>{JSON.stringify(sampleData, null, 4)}</pre>
            {/* Later here goes the JsonTreeView component */}
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)
