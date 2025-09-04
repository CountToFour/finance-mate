import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';


export const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            { path: '/', element: <Dashboard /> },
        ],
    },
]);