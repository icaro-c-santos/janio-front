import React, { useState } from 'react';
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
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import { customersService, CreateCustomerRequest } from '../services/customersService';
import { useToast } from '../contexts/ToastContext';

interface CustomerFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const CustomerForm: React.FC<CustomerFormProps> = ({ onSuccess, onCancel }) => {
    const { success: showSuccess, error: showError } = useToast();
    const [formData, setFormData] = useState<CreateCustomerRequest>({
        name: '',
        email: '',
        type: 'PF',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: keyof CreateCustomerRequest, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));

        // Limpar erro do campo quando usuário começar a digitar
        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Removido: campos aninhados não existem no novo contrato

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setIsSuccess(false);
        setFieldErrors({});

        try {
            // Validação básica no frontend
            const validationErrors: Record<string, string> = {};

            // Validar email se fornecido
            if (formData.email && formData.email.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    validationErrors.email = 'Formato de email inválido';
                }
            }

            // Validar campos obrigatórios
            if (!formData.name || formData.name.trim() === '') {
                validationErrors.name = 'Nome é obrigatório';
            }
            if (!formData.type) {
                validationErrors.type = 'Tipo é obrigatório';
            }

            if (Object.keys(validationErrors).length > 0) {
                setFieldErrors(validationErrors);
                setError('Por favor, corrija os erros nos campos destacados');
                setLoading(false);
                return;
            }

            await customersService.createCustomer({
                name: formData.name.trim(),
                email: formData.email?.trim() || undefined,
                type: formData.type,
            });
            setIsSuccess(true);
            showSuccess('Cliente cadastrado com sucesso!');
            onSuccess?.();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro ao cadastrar cliente';

            // Tentar extrair erros específicos de campos
            if (errorMessage.includes('Dados inválidos:')) {
                setError('Dados inválidos. Verifique os campos destacados.');
                showError('Dados inválidos. Verifique os campos destacados.');
            } else {
                setError(errorMessage);
                showError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            type: 'PF',
        });
        setError(null);
        setIsSuccess(false);
        setFieldErrors({});
    };

    return (
        <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h2" gutterBottom>
                Cadastrar Novo Cliente
            </Typography>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {isSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    Cliente cadastrado com sucesso!
                </Alert>
            )}

            <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                    {/* Tipo de Cliente */}
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo de Cliente</InputLabel>
                            <Select
                                value={formData.type}
                                label="Tipo de Cliente"
                                onChange={(e) => handleInputChange('type', e.target.value as any)}
                            >
                                <MenuItem value="PF">Pessoa Física</MenuItem>
                                <MenuItem value="PJ">Pessoa Jurídica</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            helperText={fieldErrors.email || "Opcional"}
                            error={!!fieldErrors.email}
                        />
                    </Grid>

                    {/* Nome */}
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Nome"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            required
                            error={!!fieldErrors.name}
                            helperText={fieldErrors.name}
                        />
                    </Grid>

                    {/* Campos removidos: endereço e telefone não fazem parte do novo contrato */}

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
                                {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};

export default CustomerForm;
