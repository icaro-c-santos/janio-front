import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    Divider,
    FormHelperText,
} from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { salesService, CreateSaleRequest, Product } from '../services/salesService';
import { useToast } from '../contexts/ToastContext';

interface SalesFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    onConfirm?: (saleData: CreateSaleRequest) => void;
}

interface Customer {
    id: string;
    name: string;
    type: "INDIVIDUAL" | "COMPANY";
}

const SalesForm: React.FC<SalesFormProps> = ({ onSuccess, onCancel, onConfirm }) => {
    const { success: showSuccess, error: showError } = useToast();

    const [formData, setFormData] = useState<CreateSaleRequest>({
        productId: '',
        customerId: '',
        quantity: 1,
        price: 0,
        totalValue: 0,
        saleDate: new Date().toISOString().split('T')[0],
        file: undefined,
    });

    const [products, setProducts] = useState<Product[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Carregar dados iniciais
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingData(true);

                // Carregar produtos e clientes em paralelo
                const [productsData, customersData] = await Promise.all([
                    salesService.getProducts(),
                    salesService.getCustomers()
                ]);

                setProducts(productsData);
                setCustomers(customersData);

                // Preselecionar primeiro produto
                if (productsData.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        productId: productsData[0].id,
                        price: productsData[0].price || 0,
                        totalValue: (productsData[0].price || 0) * prev.quantity
                    }));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
                showError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            } finally {
                setLoadingData(false);
            }
        };

        loadInitialData();
    }, [showError]);

    // Calcular valor total quando quantidade ou preço mudar
    useEffect(() => {
        const quantity = Number(formData.quantity) || 0;
        const price = Number(formData.price) || 0;
        const total = quantity * price;
        setFormData(prev => ({ ...prev, totalValue: total }));
    }, [formData.quantity, formData.price]);

    // Buscar preço específico quando cliente for selecionado
    const handleCustomerChange = async (customerId: string) => {
        if (!customerId || !formData.productId) {
            setFormData(prev => ({ ...prev, customerId }));
            return;
        }

        try {
            console.log('Buscando preço específico para:', { productId: formData.productId, customerId });
            const specificPrice = await salesService.getProductPriceByCustomer(
                formData.productId,
                customerId
            );

            console.log('Preço específico retornado:', specificPrice);

            const selectedProduct = products.find(p => p.id === formData.productId);
            const finalPrice = specificPrice !== null ? specificPrice : (selectedProduct?.price || 0);

            console.log('Preço final a ser aplicado:', finalPrice);

            setFormData(prev => ({
                ...prev,
                customerId,
                price: finalPrice,
                totalValue: finalPrice * prev.quantity
            }));
        } catch (err) {
            console.error('Erro ao buscar preço específico:', err);
            // Em caso de erro, mantém o preço padrão
            const selectedProduct = products.find(p => p.id === formData.productId);
            setFormData(prev => ({
                ...prev,
                customerId,
                price: selectedProduct?.price || 0,
                totalValue: (selectedProduct?.price || 0) * prev.quantity
            }));
        }
    };

    const handleInputChange = (field: keyof CreateSaleRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Se o produto foi alterado e já há um cliente selecionado, buscar preço específico
        if (field === 'productId' && formData.customerId) {
            handleProductChange(value, formData.customerId);
        }

        // Limpar erro do campo
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Buscar preço específico quando produto for alterado e cliente já estiver selecionado
    const handleProductChange = async (productId: string, customerId: string) => {
        if (!productId || !customerId) return;

        try {
            const specificPrice = await salesService.getProductPriceByCustomer(
                productId,
                customerId
            );

            const selectedProduct = products.find(p => p.id === productId);
            const finalPrice = specificPrice !== null ? specificPrice : (selectedProduct?.price || 0);

            setFormData(prev => ({
                ...prev,
                price: finalPrice,
                totalValue: finalPrice * prev.quantity
            }));
        } catch (err) {
            console.error('Erro ao buscar preço específico:', err);
            const selectedProduct = products.find(p => p.id === productId);
            setFormData(prev => ({
                ...prev,
                price: selectedProduct?.price || 0,
                totalValue: (selectedProduct?.price || 0) * prev.quantity
            }));
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, file }));
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.productId) {
            errors.productId = 'Produto é obrigatório';
        }

        if (!formData.customerId) {
            errors.customerId = 'Cliente é obrigatório';
        }

        if (!formData.quantity || formData.quantity <= 0) {
            errors.quantity = 'Quantidade deve ser maior que zero';
        }

        if (!formData.price || formData.price <= 0) {
            errors.price = 'Preço deve ser maior que zero';
        }

        if (!formData.saleDate) {
            errors.saleDate = 'Data da venda é obrigatória';
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setError('Por favor, corrija os erros nos campos destacados');
            return;
        }

        if (onConfirm) {
            onConfirm(formData);
        } else {
            // Se não há modal de confirmação, cria a venda diretamente
            await createSale();
        }
    };

    const createSale = async () => {
        setLoading(true);
        setError(null);

        try {
            await salesService.createSale(formData);
            showSuccess('Venda cadastrada com sucesso!');
            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar venda';
            setError(errorMessage);
            showError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            productId: products.length > 0 ? products[0].id : '',
            customerId: '',
            quantity: 1,
            price: products.length > 0 ? products[0].price || 0 : 0,
            totalValue: products.length > 0 ? products[0].price || 0 : 0,
            saleDate: new Date().toISOString().split('T')[0],
            file: undefined,
        });
        setSelectedFile(null);
        setError(null);
        setFieldErrors({});
    };

    if (loadingData) {
        return (
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                    <CircularProgress />
                </Box>
            </Paper>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Cadastrar Nova Venda
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Produto */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!fieldErrors.productId}>
                            <InputLabel>Produto</InputLabel>
                            <Select
                                value={formData.productId}
                                label="Produto"
                                onChange={(e) => handleInputChange('productId', e.target.value)}
                            >
                                {products.map((product) => (
                                    <MenuItem key={product.id} value={product.id}>
                                        {product.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldErrors.productId && (
                                <FormHelperText>{fieldErrors.productId}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    {/* Cliente */}
                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth error={!!fieldErrors.customerId}>
                            <InputLabel>Cliente</InputLabel>
                            <Select
                                value={formData.customerId}
                                label="Cliente"
                                onChange={(e) => handleCustomerChange(e.target.value)}
                            >
                                {customers.map((customer) => (
                                    <MenuItem key={customer.id} value={customer.id}>
                                        {customer.name} ({customer.type === 'INDIVIDUAL' ? 'PF' : 'PJ'})
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldErrors.customerId && (
                                <FormHelperText>{fieldErrors.customerId}</FormHelperText>
                            )}
                        </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }}>
                            <Typography variant="h6">Detalhes da Venda</Typography>
                        </Divider>
                    </Grid>

                    {/* Quantidade */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Quantidade"
                            type="number"
                            value={formData.quantity || ''}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                handleInputChange('quantity', isNaN(value) ? 1 : value);
                            }}
                            error={!!fieldErrors.quantity}
                            helperText={fieldErrors.quantity || 'Digite a quantidade'}
                            inputProps={{ min: 1 }}
                            required
                        />
                    </Grid>

                    {/* Preço */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Preço Unitário"
                            type="number"
                            value={formData.price || ''}
                            onChange={(e) => {
                                const value = parseFloat(e.target.value);
                                handleInputChange('price', isNaN(value) ? 0 : value);
                            }}
                            error={!!fieldErrors.price}
                            helperText={fieldErrors.price || 'Digite o preço unitário'}
                            inputProps={{ min: 0, step: 0.01 }}
                            required
                        />
                    </Grid>

                    {/* Valor Total */}
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Valor Total"
                            type="number"
                            value={isNaN(formData.totalValue) ? '0.00' : formData.totalValue.toFixed(2)}
                            InputProps={{ readOnly: true }}
                            helperText="Calculado automaticamente"
                        />
                    </Grid>

                    {/* Data da Venda */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Data da Venda"
                            type="date"
                            value={formData.saleDate}
                            onChange={(e) => handleInputChange('saleDate', e.target.value)}
                            error={!!fieldErrors.saleDate}
                            helperText={fieldErrors.saleDate}
                            InputLabelProps={{ shrink: true }}
                            required
                        />
                    </Grid>

                    {/* Anexo PDF */}
                    <Grid item xs={12} md={6}>
                        <Box>
                            <input
                                accept=".pdf"
                                style={{ display: 'none' }}
                                id="file-upload"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AttachFileIcon />}
                                    fullWidth
                                    sx={{ mb: 1 }}
                                >
                                    {selectedFile ? selectedFile.name : 'Anexar PDF (Opcional)'}
                                </Button>
                            </label>
                            {selectedFile && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                    Arquivo selecionado: {selectedFile.name}
                                </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" display="block">
                                Apenas arquivos PDF são aceitos
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Botões */}
                    <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                            <Button
                                variant="outlined"
                                onClick={onCancel || resetForm}
                                disabled={loading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} /> : null}
                            >
                                {loading ? 'Cadastrando...' : 'Confirmar Venda'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default SalesForm;
