import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import Register from "./pages/Register.tsx";
import Expenses from "./pages/expenses/Expenses.tsx";
import Accounts from "./pages/accounts/Accounts.tsx";
import BudgetPage from "./pages/budgets/BudgetPage.tsx";
import Income from "./pages/income/Income.tsx";
import SettingsPage from './pages/settings/SettingsPage'
import ReportsPage from './pages/reports/ReportsPage'
import Dashboard from "./pages/dashboard/Dashboard.tsx";


export const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },
    {
        path: '/',
        element: (
            <ProtectedRoute>
                <Layout />
            </ProtectedRoute>
        ),
        children: [
            { path: '/dashboard', element: <Dashboard /> },
            { path: '/expenses', element: <Expenses />},
            { path: '/accounts', element: <Accounts />},
            { path: '/budgets', element: <BudgetPage />},
            { path: '/incomes', element: <Income />},
            { path: '/settings', element: <SettingsPage /> },
            { path: '/reports', element: <ReportsPage /> },
        ],
    },
]);