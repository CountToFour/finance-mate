import {createRoot} from 'react-dom/client'
import App from './App.tsx'
import './lib/i18n.ts'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
        <QueryClientProvider client={queryClient}>
            <App/>
        </QueryClientProvider>
)
