import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    FormControlLabel,
    Checkbox,
    Alert,
    CircularProgress,
    Divider,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import { customersService, CreateCustomerRequest } from '../services/customersService';
import { useToast } from '../contexts/ToastContext';

interface MobileCustomerFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const steps = ['Dados Básicos', 'Endereço', 'Telefone'];

const MobileCustomerForm: React.FC<MobileCustomerFormProps> = ({ onSuccess, onCancel }) => {
    const { success: showSuccess, error: showError } = useToast();
    const [activeStep, setActiveStep] = useState(0);
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

        if (fieldErrors[field]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);
        setIsSuccess(false);
        setFieldErrors({});

        try {
            const validationErrors: Record<string, string> = {};

            if (formData.user.email && formData.user.email.trim() !== '') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.user.email)) {
                    validationErrors.email = 'Formato de email inválido';
                }
            }

            if (formData.user.type === 'INDIVIDUAL' && formData.user.individual?.cpf) {
                const cpf = formData.user.individual.cpf.replace(/\D/g, '');
                if (cpf.length < 11) {
                    validationErrors.cpf = 'CPF deve ter pelo menos 11 dígitos';
                }
            }

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

            const submitData: CreateCustomerRequest = {
                user: {
                    ...formData.user,
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

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={formData.user.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            helperText={fieldErrors.email || "Opcional"}
                            error={!!fieldErrors.email}
                        />

                        {formData.user.type === 'INDIVIDUAL' ? (
                            <>
                                <TextField
                                    fullWidth
                                    label="CPF"
                                    value={formData.user.individual?.cpf || ''}
                                    onChange={(e) => handleNestedInputChange('individual', 'cpf', e.target.value)}
                                    helperText={fieldErrors.cpf}
                                    error={!!fieldErrors.cpf}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Nome Completo"
                                    value={formData.user.individual?.fullName || ''}
                                    onChange={(e) => handleNestedInputChange('individual', 'fullName', e.target.value)}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Data de Nascimento"
                                    type="date"
                                    value={formData.user.individual?.birthDate || ''}
                                    onChange={(e) => handleNestedInputChange('individual', 'birthDate', e.target.value)}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </>
                        ) : (
                            <>
                                <TextField
                                    fullWidth
                                    label="CNPJ"
                                    value={formData.user.company?.cnpj || ''}
                                    onChange={(e) => handleNestedInputChange('company', 'cnpj', e.target.value)}
                                    helperText={fieldErrors.cnpj}
                                    error={!!fieldErrors.cnpj}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Razão Social"
                                    value={formData.user.company?.legalName || ''}
                                    onChange={(e) => handleNestedInputChange('company', 'legalName', e.target.value)}
                                    required
                                />
                                <TextField
                                    fullWidth
                                    label="Nome Fantasia"
                                    value={formData.user.company?.tradeName || ''}
                                    onChange={(e) => handleNestedInputChange('company', 'tradeName', e.target.value)}
                                />
                                <TextField
                                    fullWidth
                                    label="Inscrição Estadual"
                                    value={formData.user.company?.stateRegistration || ''}
                                    onChange={(e) => handleNestedInputChange('company', 'stateRegistration', e.target.value)}
                                />
                            </>
                        )}
                    </Box>
                );

            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            label="Rua"
                            value={formData.user.address.street}
                            onChange={(e) => handleNestedInputChange('address', 'street', e.target.value)}
                            required
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Número"
                                value={formData.user.address.number}
                                onChange={(e) => handleNestedInputChange('address', 'number', e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                label="CEP"
                                value={formData.user.address.postalCode}
                                onChange={(e) => handleNestedInputChange('address', 'postalCode', e.target.value)}
                                required
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Bairro"
                            value={formData.user.address.district}
                            onChange={(e) => handleNestedInputChange('address', 'district', e.target.value)}
                            required
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="Cidade"
                                value={formData.user.address.city}
                                onChange={(e) => handleNestedInputChange('address', 'city', e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Estado"
                                value={formData.user.address.state}
                                onChange={(e) => handleNestedInputChange('address', 'state', e.target.value)}
                                required
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="País"
                            value={formData.user.address.country}
                            onChange={(e) => handleNestedInputChange('address', 'country', e.target.value)}
                            required
                        />
                    </Box>
                );

            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                fullWidth
                                label="DDD"
                                value={formData.user.phone.areaCode}
                                onChange={(e) => handleNestedInputChange('phone', 'areaCode', e.target.value)}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Número do Telefone"
                                value={formData.user.phone.number}
                                onChange={(e) => handleNestedInputChange('phone', 'number', e.target.value)}
                                required
                            />
                        </Box>
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
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.user.phone.isWhatsapp}
                                    onChange={(e) => handleNestedInputChange('phone', 'isWhatsapp', e.target.checked)}
                                />
                            }
                            label="É WhatsApp"
                        />
                    </Box>
                );

            default:
                return null;
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" component="h2" gutterBottom>
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

            <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
                {steps.map((label) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>

            <Box sx={{ mb: 3 }}>
                {renderStepContent(activeStep)}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    variant="outlined"
                >
                    Voltar
                </Button>

                {activeStep === steps.length - 1 ? (
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                        {loading ? 'Cadastrando...' : 'Cadastrar'}
                    </Button>
                ) : (
                    <Button variant="contained" onClick={handleNext}>
                        Próximo
                    </Button>
                )}
            </Box>
        </Paper>
    );
};

export default MobileCustomerForm;
