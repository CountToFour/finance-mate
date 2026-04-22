import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import Login from './pages/auth/Login.tsx';
import Register from "./pages/auth/Register.tsx";
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';

const Dashboard = lazy(() => import('./pages/dashboard/Dashboard.tsx'));
const Expenses = lazy(() => import('./pages/expenses/Expenses.tsx'));
const Accounts = lazy(() => import('./pages/accounts/Accounts.tsx'));
const BudgetPage = lazy(() => import('./pages/budgets/BudgetPage.tsx'));
const Income = lazy(() => import('./pages/income/Income.tsx'));
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage.tsx'));
const ReportsPage = lazy(() => import('./pages/reports/ReportsPage.tsx'));

const PageLoader = () => (
    <div className="flex justify-center items-center h-full p-20">
        <span className="text-gray-500 text-lg animate-pulse">Pobieranie modułu...</span>
    </div>
);

const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<PageLoader />}>
        <Component />
    </Suspense>
);

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
            { path: '/dashboard', element: withSuspense(Dashboard) },
            { path: '/expenses', element: withSuspense(Expenses) },
            { path: '/accounts', element: withSuspense(Accounts) },
            { path: '/budgets', element: withSuspense(BudgetPage) },
            { path: '/incomes', element: withSuspense(Income) },
            { path: '/settings', element: withSuspense(SettingsPage) },
            { path: '/reports', element: withSuspense(ReportsPage) },
        ],
    },
]);