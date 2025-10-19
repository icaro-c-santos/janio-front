import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    CircularProgress,
    FormHelperText,
    Stepper,
    Step,
    StepLabel,
    Paper,
    Divider,
    Chip,
} from '@mui/material';
import { AttachFile as AttachFileIcon } from '@mui/icons-material';
import { CreateSaleRequest } from '../../../services/salesService';
import { customersService, Customer } from '../../../services/customersService';
import { useToast } from '../../../contexts/ToastContext';

interface MobileSalesFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
    onConfirm?: (saleData: CreateSaleRequest) => void;
}

const steps = ['Cliente', 'Detalhes da Venda', 'Confirmação'];

const MobileSalesForm: React.FC<MobileSalesFormProps> = ({ onSuccess, onCancel, onConfirm }) => {
    const { success: showSuccess, error: showError } = useToast();

    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState<CreateSaleRequest>({
        customerId: '',
        quantity: 1,
        unitPrice: 0,
        saleDate: new Date().toISOString().split('T')[0],
        receipt: undefined,
    });

    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoadingData(true);

                const customersData = await customersService.getAllCustomers();
                setCustomers(customersData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
                showError(err instanceof Error ? err.message : 'Erro ao carregar dados');
            } finally {
                setLoadingData(false);
            }
        };

        loadInitialData();
    }, [showError]);

    const handleCustomerChange = async (customerId: string) => {
        setFormData(prev => ({ ...prev, customerId }));
    };

    const handleInputChange = (field: keyof CreateSaleRequest, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setFormData(prev => ({ ...prev, receipt: file }));
        }
    };

    const validateStep = (step: number): boolean => {
        const errors: Record<string, string> = {};

        if (step === 0) {
            if (!formData.customerId) {
                errors.customerId = 'Cliente é obrigatório';
            }
        } else if (step === 1) {
            if (!formData.quantity || formData.quantity <= 0) {
                errors.quantity = 'Quantidade deve ser maior que zero';
            }
            if (!formData.unitPrice || formData.unitPrice <= 0) {
                errors.unitPrice = 'Preço deve ser maior que zero';
            }
            if (!formData.saleDate) {
                errors.saleDate = 'Data da venda é obrigatória';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(activeStep)) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(1)) {
            setError('Por favor, corrija os erros nos campos destacados');
            return;
        }

        if (onConfirm) {
            onConfirm(formData);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const getSelectedCustomer = () => customers.find(c => c.id === formData.customerId);
    const totalValue = (Number(formData.quantity) || 0) * (Number(formData.unitPrice) || 0);

    if (loadingData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, p: 2 }}>
                <CircularProgress />
            </Box>
        );
    }

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Cliente
                        </Typography>

                        <FormControl fullWidth error={!!fieldErrors.customerId}>
                            <InputLabel>Cliente</InputLabel>
                            <Select
                                value={formData.customerId}
                                label="Cliente"
                                onChange={(e) => handleCustomerChange(e.target.value)}
                            >
                                {customers.map((customer) => (
                                    <MenuItem key={customer.id} value={customer.id}>
                                        {customer.name}
                                    </MenuItem>
                                ))}
                            </Select>
                            {fieldErrors.customerId && (
                                <FormHelperText>{fieldErrors.customerId}</FormHelperText>
                            )}
                        </FormControl>
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Detalhes da Venda
                        </Typography>

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
                            sx={{ mb: 2 }}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Preço Unitário"
                            type="number"
                            value={formData.unitPrice || ''}
                            onChange={(e) => {
                                const raw = String(e.target.value).replace(',', '.');
                                const value = parseFloat(raw);
                                handleInputChange('unitPrice', isNaN(value) ? 0 : value);
                            }}
                            error={!!fieldErrors.unitPrice}
                            helperText={fieldErrors.unitPrice || 'Digite o preço unitário'}
                            inputProps={{ min: 0, step: 0.01 }}
                            sx={{ mb: 2 }}
                            required
                        />

                        <TextField
                            fullWidth
                            label="Data da Venda"
                            type="date"
                            value={formData.saleDate}
                            onChange={(e) => handleInputChange('saleDate', e.target.value)}
                            error={!!fieldErrors.saleDate}
                            helperText={fieldErrors.saleDate}
                            InputLabelProps={{ shrink: true }}
                            sx={{ mb: 2 }}
                            required
                        />

                        <Box>
                            <input
                                accept=".pdf"
                                style={{ display: 'none' }}
                                id="file-upload-mobile"
                                type="file"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="file-upload-mobile">
                                <Button
                                    variant="outlined"
                                    component="span"
                                    startIcon={<AttachFileIcon />}
                                    fullWidth
                                >
                                    {selectedFile ? selectedFile.name : 'Anexar Recibo PDF (Opcional)'}
                                </Button>
                            </label>
                            {selectedFile && (
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                    Arquivo selecionado: {selectedFile.name}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                            Confirmação
                        </Typography>

                        <Paper sx={{ p: 2, mb: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Resumo da Venda
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Cliente:</Typography>
                                    <Typography variant="body2">{getSelectedCustomer()?.name}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Quantidade:</Typography>
                                    <Typography variant="body2">{formData.quantity}</Typography>
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="text.secondary">Preço Unit.:</Typography>
                                    <Typography variant="body2">{formatCurrency(Number(formData.unitPrice))}</Typography>
                                </Box>

                                <Divider sx={{ my: 1 }} />

                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Typography variant="h6" color="primary">Total:</Typography>
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                        {formatCurrency(totalValue)}
                                    </Typography>
                                </Box>

                                {selectedFile && (
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                        <Typography variant="body2" color="text.secondary">Anexo:</Typography>
                                        <Chip label="PDF" size="small" color="primary" />
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Box>
            <Stepper activeStep={activeStep} sx={{ p: 2 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            {error && (
                <Alert severity="error" sx={{ m: 2 }}>
                    {error}
                </Alert>
            )}

            {renderStepContent(activeStep)}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, pt: 1 }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                >
                    Voltar
                </Button>

                {activeStep === steps.length - 1 ? (
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Confirmando...' : 'Confirmar Venda'}
                    </Button>
                ) : (
                    <Button
                        onClick={handleNext}
                        variant="contained"
                    >
                        Próximo
                    </Button>
                )}
            </Box>
        </Box>
    );
};

export default MobileSalesForm;
