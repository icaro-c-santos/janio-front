import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#2c3e50",
          color: "white",
          padding: "20px 0",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
        }}
      >
        {/* Logo */}
        <div
          style={{
            textAlign: "center",
            padding: "20px",
            borderBottom: "1px solid #34495e",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#4CAF50",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
              fontSize: "1.5rem",
              fontWeight: "bold",
            }}
          >
            J
          </div>
          <h3 style={{ margin: "0", fontSize: "1.2rem" }}>Janio ERP</h3>
        </div>

        {/* Menu */}
        <nav style={{ padding: "20px 0" }}>
          <Link
            to="/"
            style={{
              display: "block",
              padding: "15px 20px",
              color: "white",
              textDecoration: "none",
              backgroundColor: isActive("/") ? "#4CAF50" : "transparent",
              borderLeft: isActive("/")
                ? "4px solid #4CAF50"
                : "4px solid transparent",
            }}
          >
            🏠 Home
          </Link>

          {String(user?.role || "").toLowerCase() === "admin" && (
            <>
              <Link
                to="/customers"
                style={{
                  display: "block",
                  padding: "15px 20px",
                  color: "white",
                  textDecoration: "none",
                  backgroundColor: isActive("/customers")
                    ? "#4CAF50"
                    : "transparent",
                  borderLeft: isActive("/customers")
                    ? "4px solid #4CAF50"
                    : "4px solid transparent",
                }}
              >
                👥 Clientes
              </Link>
              <Link
                to="/sales"
                style={{
                  display: "block",
                  padding: "15px 20px",
                  color: "white",
                  textDecoration: "none",
                  backgroundColor: isActive("/sales")
                    ? "#4CAF50"
                    : "transparent",
                  borderLeft: isActive("/sales")
                    ? "4px solid #4CAF50"
                    : "4px solid transparent",
                }}
              >
                💰 Vendas
              </Link>
              <Link
                to="/compras"
                style={{
                  display: "block",
                  padding: "15px 20px",
                  color: "white",
                  textDecoration: "none",
                  backgroundColor: isActive("/compras")
                    ? "#4CAF50"
                    : "transparent",
                  borderLeft: isActive("/compras")
                    ? "4px solid #4CAF50"
                    : "4px solid transparent",
                }}
              >
                🛒 Compras
              </Link>
              <Link
                to="/reports"
                style={{
                  display: "block",
                  padding: "15px 20px",
                  color: "white",
                  textDecoration: "none",
                  backgroundColor: isActive("/reports")
                    ? "#4CAF50"
                    : "transparent",
                  borderLeft: isActive("/reports")
                    ? "4px solid #4CAF50"
                    : "4px solid transparent",
                }}
              >
                📊 Relatórios
              </Link>
            </>
          )}
        </nav>

        {/* User Info */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
            padding: "15px",
            backgroundColor: "#34495e",
            borderRadius: "8px",
          }}
        >
          <div style={{ fontSize: "14px", marginBottom: "5px" }}>
            {user?.name}
          </div>
          <div style={{ fontSize: "12px", color: "#bdc3c7" }}>
            {String(user?.role || "").toLowerCase() === "admin" ? "Administrador" : "Cliente"}
          </div>
          <button
            onClick={logout}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              backgroundColor: "#e74c3c",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px",
              width: "100%",
            }}
          >
            Sair
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div
        style={{
          marginLeft: "250px",
          flex: 1,
          backgroundColor: "#f5f5f5",
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: "white",
            padding: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <h1
            style={{
              margin: "0",
              color: "#333",
              fontSize: "1.8rem",
            }}
          >
            {location.pathname === "/" && "Dashboard"}
            {location.pathname === "/customers" && "Clientes"}
            {location.pathname === "/sales" && "Vendas"}
            {location.pathname === "/compras" && "Compras"}
          </h1>
        </header>

        {/* Page Content */}
        <main style={{ padding: "20px" }}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
