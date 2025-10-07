import React from "react";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px",
        }}
      >
        <h1 style={{ color: "#4CAF50", marginBottom: "10px" }}>
          Bem-vindo ao Janio ERP
        </h1>
        <p style={{ color: "#666", fontSize: "16px", marginBottom: "20px" }}>
          Olá, {user?.name}! Sistema de gestão para empresa de água de coco.
        </p>

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "8px",
            border: "1px solid #e9ecef",
          }}
        >
          <h3 style={{ color: "#333", marginBottom: "15px" }}>
            Informações do Usuário:
          </h3>
          <p>
            <strong>Nome:</strong> {user?.name}
          </p>
          <p>
            <strong>Email:</strong> {user?.email}
          </p>
          <p>
            <strong>Tipo:</strong>{" "}
            {user?.role === "admin" ? "Administrador" : "Cliente"}
          </p>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#4CAF50" }}>Vendas</h3>
          <p style={{ color: "#666" }}>Gerencie suas vendas de água de coco</p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#4CAF50" }}>Estoque</h3>
          <p style={{ color: "#666" }}>
            Controle de produtos e matérias-primas
          </p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#4CAF50" }}>Clientes</h3>
          <p style={{ color: "#666" }}>Cadastro e gestão de clientes</p>
        </div>

        <div
          style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          <h3 style={{ color: "#4CAF50" }}>Relatórios</h3>
          <p style={{ color: "#666" }}>Análises e relatórios gerenciais</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
