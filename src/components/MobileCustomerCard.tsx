import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    IconButton,
    Divider,
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Customer } from '../services/customersService';

interface MobileCustomerCardProps {
    customer: Customer;
    onEdit?: (customer: Customer) => void;
    onDelete?: (customer: Customer) => void;
}

const MobileCustomerCard: React.FC<MobileCustomerCardProps> = ({
    customer,
    onEdit,
    onDelete,
}) => {
    const getCustomerName = () => {
        if (customer.user.type === 'INDIVIDUAL' && customer.user.individual) {
            return customer.user.individual.fullName;
        } else if (customer.user.type === 'COMPANY' && customer.user.company) {
            return customer.user.company.legalName;
        }
        return '-';
    };

    const formatDocument = () => {
        if (customer.user.type === 'INDIVIDUAL' && customer.user.individual) {
            return customer.user.individual.cpf;
        } else if (customer.user.type === 'COMPANY' && customer.user.company) {
            return customer.user.company.cnpj;
        }
        return '-';
    };

    const formatPhone = () => {
        const phone = customer.user.primaryPhone;
        if (!phone || !phone.areaCode || !phone.number) {
            return 'Não informado';
        }
        return `(${phone.areaCode}) ${phone.number}`;
    };

    return (
        <Card sx={{ mb: 2, borderRadius: 2 }}>
            <CardContent>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" component="h3" gutterBottom>
                            {getCustomerName()}
                        </Typography>
                        <Chip
                            label={customer.user.type === 'INDIVIDUAL' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                            color={customer.user.type === 'INDIVIDUAL' ? 'primary' : 'secondary'}
                            size="small"
                        />
                    </Box>
                    <Box>
                        <IconButton size="small" color="primary" onClick={() => onEdit?.(customer)}>
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => onDelete?.(customer)}>
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Contact Info */}
                <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhoneIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {formatPhone()}
                            {customer.user.primaryPhone?.isWhatsapp && (
                                <Chip label="WhatsApp" size="small" color="success" sx={{ ml: 1 }} />
                            )}
                        </Typography>
                    </Box>

                    {customer.user.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <EmailIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                                {customer.user.email}
                            </Typography>
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                            {customer.user.primaryAddress.city}, {customer.user.primaryAddress.state}
                        </Typography>
                    </Box>
                </Box>

                {/* Document */}
                <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                        {customer.user.type === 'INDIVIDUAL' ? 'CPF' : 'CNPJ'}
                    </Typography>
                    <Typography variant="body2">
                        {formatDocument()}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default MobileCustomerCard;
