import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import CustomersPage from './pages/customers/index';
import Home from './pages/Home';
import InventoryPage from './pages/inventory';
import Login from './pages/Login';
import ResponsiveLayout from './components/ResponsiveLayout';
import PrivateRoute from './components/PrivateRoute';
import ToastContainer from './components/ToastContainer';
import ReportsPage from './pages/reports';
import SuppliersPage from './pages/suppliers';
import InventoryPurchasesPage from './pages/financial/components/InventoryPurchasesSection';
import SalesPage from './pages/Sales';
import FinancialPage from './pages/financial';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastProvider>
                <AuthProvider>
                    <Router>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route path="/" element={
                                <PrivateRoute>
                                    <ResponsiveLayout>
                                        <Home />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/customers" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <CustomersPage />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/vendas" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <SalesPage />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/estoque" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <InventoryPage />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/financeiro" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <FinancialPage />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/fornecedores" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <SuppliersPage />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/reports" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <ReportsPage />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                        </Routes>
                        <ToastContainer />
                    </Router>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}

export default App;

