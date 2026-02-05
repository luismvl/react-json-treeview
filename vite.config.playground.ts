import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    root: 'dev',
    base: '/react-json-treeview/',
    plugins: [react()],
    build: {
        outDir: '../dist-playground',
        emptyOutDir: true,
    },
})
