import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { theme } from "./theme";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Vendas from "./pages/Vendas";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rota pública - Login */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />

            {/* Rotas protegidas */}
            <Route
              path="/"
              element={
                <ProtectedRoute requiredRole="home">
                  <Layout>
                    <Home />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/vendas"
              element={
                <ProtectedRoute requiredRole="vendas">
                  <Layout>
                    <Vendas />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Rota de não autorizado */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Rota 404 */}
            <Route path="/404" element={<NotFound />} />

            {/* Redirecionamento para 404 para rotas não encontradas */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
