import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react';

export default defineConfig({
    root: 'src/popup',
    base: './',
    publicDir: path.resolve(__dirname, 'public'),
    plugins: [react()],
    build: {
        outDir: '../../dist/popup',
        emptyOutDir: true
    }
})
