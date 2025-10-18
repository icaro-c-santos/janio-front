import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import SalesForm from '../components/SalesForm';
import SalesList from '../components/SalesList';
import SaleConfirmationModal from '../components/SaleConfirmationModal';
import SaleSuccessModal from '../components/SaleSuccessModal';
import SaleDetailsModal from '../components/SaleDetailsModal';
import MobileSalesForm from '../components/MobileSalesForm';
import MobileSalesCard from '../components/MobileSalesCard';
import { salesService, Sale, CreateSaleRequest } from '../services/salesService';
import { useToast } from '../contexts/ToastContext';
import { useMobile } from '../hooks/useMobile';

const Sales: React.FC = () => {
  const { success: showSuccess, error: showError } = useToast();
  const isMobile = useMobile();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [pendingSale, setPendingSale] = useState<CreateSaleRequest | null>(null);
  const [completedSale, setCompletedSale] = useState<CreateSaleRequest | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 20;

  // Estados para modal de detalhes
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const loadSales = async (pageNumber: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await salesService.getAllSales({ page: pageNumber, pageSize });
      setSales(response.items || []);
      const total = response.total || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / pageSize));
      setPage(response.page || pageNumber);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar vendas';

      if (errorMessage.includes('conexão')) {
        setError('Erro de conexão. Verifique se a API está rodando.');
      } else if (errorMessage.includes('500')) {
        setError('Erro interno do servidor. Tente novamente mais tarde.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSales();
  }, []);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    loadSales(value);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setShowConfirmation(false);
    setShowSuccessModal(false);
    setPendingSale(null);
    setCompletedSale(null);
    loadSales(page); // Recarregar a página atual
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setShowConfirmation(false);
    setShowSuccessModal(false);
    setPendingSale(null);
    setCompletedSale(null);
  };

  const handleFormConfirm = (saleData: CreateSaleRequest) => {
    setPendingSale(saleData);
    setShowForm(false);
    setShowConfirmation(true);
  };

  const handleConfirmSale = async () => {
    if (!pendingSale) return;

    setLoading(true);
    try {
      await salesService.createSale(pendingSale);
      setCompletedSale(pendingSale);
      setShowConfirmation(false);
      setShowSuccessModal(true);
      showSuccess('Venda cadastrada com sucesso!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar venda';
      showError(errorMessage);
      setShowConfirmation(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSaleClick = async (sale: Sale) => {
    setSelectedSale(sale);
    setShowDetailsModal(true);
    setDetailsLoading(true);

    try {
      // Buscar detalhes completos da venda
      const response = await salesService.getSaleById(sale.id);
      if (response.success && response.data) {
        setSelectedSale(response.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar detalhes da venda';
      showError(errorMessage);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedSale(null);
    setDetailsLoading(false);
  };

  const getCustomerName = (customerId: string) => `Cliente ${customerId.slice(0, 8)}`;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Vendas
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowForm(true)}
        >
          Nova Venda
        </Button>
      </Box>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => loadSales(page)}
            >
              Tentar Novamente
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Últimas Vendas
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Total de {totalItems} venda(s) encontrada(s)
        </Typography>
      </Box>

      {isMobile ? (
        // Mobile View - Cards
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : sales.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Nenhuma venda encontrada
              </Typography>
            </Box>
          ) : (
            <>
              {sales.map((sale) => (
                <MobileSalesCard key={sale.id} sale={sale} onClick={handleSaleClick} />
              ))}

              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={() => loadSales(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Carregar Mais
                  </Button>
                </Box>
              )}
            </>
          )}
        </Box>
      ) : (
        // Desktop View - Table
        <SalesList
          sales={sales}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSaleClick={handleSaleClick}
        />
      )}

      {/* Dialog do Formulário */}
      <Dialog
        open={showForm}
        onClose={handleFormCancel}
        maxWidth={isMobile ? "sm" : "md"}
        fullWidth
        fullScreen={isMobile}
      >
        {!isMobile && <DialogTitle>Cadastrar Nova Venda</DialogTitle>}
        <DialogContent sx={{ p: isMobile ? 0 : 2 }}>
          {isMobile ? (
            <MobileSalesForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              onConfirm={handleFormConfirm}
            />
          ) : (
            <SalesForm
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
              onConfirm={handleFormConfirm}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação */}
      <SaleConfirmationModal
        open={showConfirmation}
        onClose={handleFormCancel}
        onConfirm={handleConfirmSale}
        saleData={pendingSale}
        customerName={pendingSale ? getCustomerName(pendingSale.customerId) : undefined}
        loading={loading}
      />

      {/* Modal de Sucesso */}
      <SaleSuccessModal
        open={showSuccessModal}
        onClose={handleFormSuccess}
        saleData={completedSale}
        customerName={completedSale ? getCustomerName(completedSale.customerId) : undefined}
      />

      {/* Modal de Detalhes da Venda */}
      <SaleDetailsModal
        open={showDetailsModal}
        onClose={handleCloseDetailsModal}
        sale={selectedSale}
        loading={detailsLoading}
      />
    </Box>
  );
};

export default Sales;
