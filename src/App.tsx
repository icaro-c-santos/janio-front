import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import Customers from './pages/Customers';
import Home from './pages/Home';
import Sales from './pages/Sales';
import Reports from './pages/Reports';
import Estoque from './pages/Estoque';
import Login from './pages/Login';
import ResponsiveLayout from './components/ResponsiveLayout';
import PrivateRoute from './components/PrivateRoute';
import ToastContainer from './components/ToastContainer';
import Compras from './pages/compras/index';

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
                                        <Customers />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/sales" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <Sales />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/compras" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <Compras />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/estoque-movimentacoes" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <Estoque />
                                    </ResponsiveLayout>
                                </PrivateRoute>
                            } />
                            <Route path="/reports" element={
                                <PrivateRoute requiredRole="admin">
                                    <ResponsiveLayout>
                                        <Reports />
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

