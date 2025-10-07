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
        user: {
            type: 'INDIVIDUAL',
            email: '',
            individual: {
                cpf: '',
                fullName: '',
                birthDate: '',
            },
            address: {
                street: '',
                number: '',
                district: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'Brasil',
            },
            phone: {
                areaCode: '',
                number: '',
                isWhatsapp: false,
                type: 'MOBILE',
            },
        },
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            user: {
                ...prev.user,
                [field]: value,
            },
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

    const handleNestedInputChange = (parentField: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            user: {
                ...prev.user,
                [parentField]: {
                    ...prev.user[parentField as keyof typeof prev.user],
                    [field]: value,
                },
            },
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
            if (formData.user.email && formData.user.email.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.user.email)) {
                    validationErrors.email = 'Formato de email inválido';
                }
            }

            // Validar CPF se pessoa física
            if (formData.user.type === 'INDIVIDUAL' && formData.user.individual?.cpf) {
                const cpf = formData.user.individual.cpf.replace(/\D/g, '');
                if (cpf.length < 11) {
                    validationErrors.cpf = 'CPF deve ter pelo menos 11 dígitos';
                }
            }

            // Validar CNPJ se pessoa jurídica
            if (formData.user.type === 'COMPANY' && formData.user.company?.cnpj) {
                const cnpj = formData.user.company.cnpj.replace(/\D/g, '');
                if (cnpj.length < 14) {
                    validationErrors.cnpj = 'CNPJ deve ter pelo menos 14 dígitos';
                }
            }

            if (Object.keys(validationErrors).length > 0) {
                setFieldErrors(validationErrors);
                setError('Por favor, corrija os erros nos campos destacados');
                setLoading(false);
                return;
            }

            // Preparar dados para envio
            const submitData: CreateCustomerRequest = {
                user: {
                    ...formData.user,
                    // Remover campos vazios baseado no tipo
                    individual: formData.user.type === 'INDIVIDUAL' ? formData.user.individual : undefined,
                    company: formData.user.type === 'COMPANY' ? formData.user.company : undefined,
                },
            };

            await customersService.createCustomer(submitData);
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
            user: {
                type: 'INDIVIDUAL',
                email: '',
                individual: {
                    cpf: '',
                    fullName: '',
                    birthDate: '',
                },
                address: {
                    street: '',
                    number: '',
                    district: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'Brasil',
                },
                phone: {
                    areaCode: '',
                    number: '',
                    isWhatsapp: false,
                    type: 'MOBILE',
                },
            },
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
                    <Grid item xs={12}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo de Cliente</InputLabel>
                            <Select
                                value={formData.user.type}
                                label="Tipo de Cliente"
                                onChange={(e) => handleInputChange('type', e.target.value)}
                            >
                                <MenuItem value="INDIVIDUAL">Pessoa Física</MenuItem>
                                <MenuItem value="COMPANY">Pessoa Jurídica</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Email */}
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.user.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            helperText={fieldErrors.email || "Opcional"}
                            error={!!fieldErrors.email}
                        />
                    </Grid>

                    {/* Dados específicos baseado no tipo */}
                    {formData.user.type === 'INDIVIDUAL' ? (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="CPF"
                                    value={formData.user.individual?.cpf || ''}
                                    onChange={(e) => handleNestedInputChange('individual', 'cpf', e.target.value)}
                                    helperText={fieldErrors.cpf}
                                    error={!!fieldErrors.cpf}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nome Completo"
                                    value={formData.user.individual?.fullName || ''}
                                    onChange={(e) => handleNestedInputChange('individual', 'fullName', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Data de Nascimento"
                                    type="date"
                                    value={formData.user.individual?.birthDate || ''}
                                    onChange={(e) => handleNestedInputChange('individual', 'birthDate', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                        </>
                    ) : (
                        <>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="CNPJ"
                                    value={formData.user.company?.cnpj || ''}
                                    onChange={(e) => handleNestedInputChange('company', 'cnpj', e.target.value)}
                                    helperText={fieldErrors.cnpj}
                                    error={!!fieldErrors.cnpj}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Razão Social"
                                    value={formData.user.company?.legalName || ''}
                                    onChange={(e) => handleNestedInputChange('company', 'legalName', e.target.value)}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Nome Fantasia"
                                    value={formData.user.company?.tradeName || ''}
                                    onChange={(e) => handleNestedInputChange('company', 'tradeName', e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Inscrição Estadual"
                                    value={formData.user.company?.stateRegistration || ''}
                                    onChange={(e) => handleNestedInputChange('company', 'stateRegistration', e.target.value)}
                                />
                            </Grid>
                        </>
                    )}

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }}>
                            <Typography variant="h6">Endereço</Typography>
                        </Divider>
                    </Grid>

                    {/* Endereço */}
                    <Grid item xs={12} md={8}>
                        <TextField
                            fullWidth
                            label="Rua"
                            value={formData.user.address.street}
                            onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Número"
                            value={formData.user.address.number}
                            onChange={(e) => handleNestedInputChange('address', 'number', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Bairro"
                            value={formData.user.address.district}
                            onChange={(e) => handleNestedInputChange('address', 'district', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Cidade"
                            value={formData.user.address.city}
                            onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="Estado"
                            value={formData.user.address.state}
                            onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="CEP"
                            value={formData.user.address.postalCode}
                            onChange={(e) => handleNestedInputChange('address', 'postalCode', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <TextField
                            fullWidth
                            label="País"
                            value={formData.user.address.country}
                            onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                            required
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 2 }}>
                            <Typography variant="h6">Telefone</Typography>
                        </Divider>
                    </Grid>

                    {/* Telefone */}
                    <Grid item xs={12} md={3}>
                        <TextField
                            fullWidth
                            label="DDD"
                            value={formData.user.phone.areaCode}
                            onChange={(e) => handleNestedInputChange('phone', 'areaCode', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            label="Número do Telefone"
                            value={formData.user.phone.number}
                            onChange={(e) => handleNestedInputChange('phone', 'number', e.target.value)}
                            required
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={formData.user.phone.type}
                                label="Tipo"
                                onChange={(e) => handleNestedInputChange('phone', 'type', e.target.value)}
                            >
                                <MenuItem value="MOBILE">Celular</MenuItem>
                                <MenuItem value="FIXED">Fixo</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.user.phone.isWhatsapp}
                                    onChange={(e) => handleNestedInputChange('phone', 'isWhatsapp', e.target.checked)}
                                />
                            }
                            label="É WhatsApp"
                        />
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
