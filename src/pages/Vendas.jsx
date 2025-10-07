import React, { useState, useEffect } from "react";
import {
  useSales,
  useCustomers,
  useProducts,
  useProductPrice,
} from "../hooks/useSalesApi";

const Vendas = () => {
  const {
    sales,
    totalPages,
    currentPage,
    loading,
    error,
    fetchSales,
    createSale,
    deleteSale,
  } = useSales();
  const { customers, fetchCustomers } = useCustomers();
  const { products, fetchProducts } = useProducts();
  const { fetchProductPrice } = useProductPrice();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    customerId: "",
    quantity: 1,
    unitPrice: 0,
    saleDate: new Date().toISOString().split("T")[0],
    file: null,
  });

  // Carregar dados iniciais
  useEffect(() => {
    fetchSales();
    fetchCustomers();
    fetchProducts();
  }, []);

  // Definir primeiro produto como padrão
  useEffect(() => {
    if (products.length > 0 && !formData.productId) {
      setFormData((prev) => ({ ...prev, productId: products[0].id }));
    }
  }, [products]);

  // Buscar preço quando produto ou cliente mudar
  useEffect(() => {
    if (formData.productId && formData.customerId) {
      fetchProductPrice(formData.productId, formData.customerId).then(
        (price) => {
          if (price) {
            setFormData((prev) => ({ ...prev, unitPrice: price }));
          }
        }
      );
    }
  }, [formData.productId, formData.customerId]);

  const handleCreateSale = async (e) => {
    e.preventDefault();
    try {
      await createSale(formData);
      setShowCreateModal(false);
      setFormData({
        productId: products[0]?.id || "",
        customerId: "",
        quantity: 1,
        unitPrice: 0,
        saleDate: new Date().toISOString().split("T")[0],
        file: null,
      });
      fetchSales(); // Recarregar lista
    } catch (err) {
      console.error("Erro ao criar venda:", err);
    }
  };

  const handleDeleteSale = async (saleId) => {
    if (window.confirm("Tem certeza que deseja excluir esta venda?")) {
      try {
        await deleteSale(saleId);
        fetchSales(); // Recarregar lista
        setShowDetailsModal(false);
      } catch (err) {
        console.error("Erro ao excluir venda:", err);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const openDetailsModal = (sale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? product.name : "Produto não encontrado";
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Cliente não encontrado";
  };

  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <h1 style={{ color: "#4CAF50", marginBottom: "10px", margin: 0 }}>
            Módulo de Vendas
          </h1>
          <p style={{ color: "#666", fontSize: "16px", margin: 0 }}>
            Gerencie suas vendas de água de coco e outros produtos.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            padding: "12px 24px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "500",
            fontSize: "16px",
          }}
        >
          + Nova Venda
        </button>
      </div>

      {/* Lista de Vendas */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px",
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <h3 style={{ color: "#333", margin: 0 }}>Vendas Recentes</h3>
        </div>

        {loading && (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <div>Carregando vendas...</div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#ffebee",
              color: "#c62828",
            }}
          >
            Erro ao carregar vendas: {error}
          </div>
        )}

        {!loading && !error && (
          <div>
            {sales.length === 0 ? (
              <div
                style={{ padding: "40px", textAlign: "center", color: "#666" }}
              >
                Nenhuma venda encontrada.
              </div>
            ) : (
              <div>
                {sales.map((sale) => (
                  <div
                    key={sale.id}
                    onClick={() => openDetailsModal(sale)}
                    style={{
                      padding: "20px",
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.backgroundColor = "transparent")
                    }
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <h4 style={{ margin: "0 0 5px 0", color: "#333" }}>
                          {getCustomerName(sale.customerId)}
                        </h4>
                        <p
                          style={{
                            margin: "0 0 5px 0",
                            color: "#666",
                            fontSize: "14px",
                          }}
                        >
                          {getProductName(sale.productId)} - Qtd:{" "}
                          {sale.quantity}
                        </p>
                        <p
                          style={{ margin: 0, color: "#999", fontSize: "12px" }}
                        >
                          {formatDate(sale.saleDate)}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "18px",
                            fontWeight: "bold",
                            color: "#4CAF50",
                          }}
                        >
                          {formatCurrency(sale.unitPrice * sale.quantity)}
                        </div>
                        <div style={{ fontSize: "12px", color: "#666" }}>
                          {formatCurrency(sale.unitPrice)} cada
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div
                style={{
                  padding: "20px",
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <button
                  onClick={() => fetchSales(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ddd",
                    backgroundColor: currentPage === 1 ? "#f5f5f5" : "white",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    borderRadius: "4px",
                  }}
                >
                  Anterior
                </button>
                <span style={{ padding: "8px 16px", color: "#666" }}>
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => fetchSales(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ddd",
                    backgroundColor:
                      currentPage === totalPages ? "#f5f5f5" : "white",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    borderRadius: "4px",
                  }}
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Criar Venda */}
      {showCreateModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h2 style={{ margin: "0 0 20px 0", color: "#4CAF50" }}>
              Nova Venda
            </h2>

            <form onSubmit={handleCreateSale}>
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Produto *
                </label>
                <select
                  name="productId"
                  value={formData.productId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Cliente *
                </label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                  }}
                >
                  <option value="">Selecione um cliente</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Quantidade *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Preço Unitário *
                </label>
                <input
                  type="number"
                  name="unitPrice"
                  value={formData.unitPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Data da Venda *
                </label>
                <input
                  type="date"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "30px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Arquivo (opcional)
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "16px",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "15px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: "12px 24px",
                    border: "1px solid #ddd",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Criar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Detalhes da Venda */}
      {showDetailsModal && selectedSale && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h2 style={{ margin: "0 0 20px 0", color: "#4CAF50" }}>
              Detalhes da Venda
            </h2>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ marginBottom: "15px" }}>
                <strong>Cliente:</strong>{" "}
                {getCustomerName(selectedSale.customerId)}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Produto:</strong>{" "}
                {getProductName(selectedSale.productId)}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Quantidade:</strong> {selectedSale.quantity}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Preço Unitário:</strong>{" "}
                {formatCurrency(selectedSale.unitPrice)}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Valor Total:</strong>{" "}
                {formatCurrency(selectedSale.unitPrice * selectedSale.quantity)}
              </div>
              <div style={{ marginBottom: "15px" }}>
                <strong>Data da Venda:</strong>{" "}
                {formatDate(selectedSale.saleDate)}
              </div>
              {selectedSale.fileName && (
                <div style={{ marginBottom: "15px" }}>
                  <strong>Arquivo:</strong> {selectedSale.fileName}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "15px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => handleDeleteSale(selectedSale.id)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#e74c3c",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Excluir
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "500",
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendas;
