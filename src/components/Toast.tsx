import React from 'react';
import {
    Snackbar,
    Alert,
    AlertTitle,
    IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { ToastMessage } from '../contexts/ToastContext';

interface ToastProps {
    toast: ToastMessage;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    const handleClose = () => {
        onClose(toast.id);
    };

    const getSeverity = () => {
        switch (toast.type) {
            case 'success':
                return 'success';
            case 'error':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
            default:
                return 'info';
        }
    };

    const getTitle = () => {
        switch (toast.type) {
            case 'success':
                return 'Sucesso';
            case 'error':
                return 'Erro';
            case 'warning':
                return 'Atenção';
            case 'info':
            default:
                return 'Informação';
        }
    };

    return (
        <Snackbar
            open={true}
            autoHideDuration={toast.duration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert
                severity={getSeverity()}
                onClose={handleClose}
                action={
                    <IconButton
                        size="small"
                        aria-label="close"
                        color="inherit"
                        onClick={handleClose}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
                sx={{ width: '100%' }}
            >
                <AlertTitle>{getTitle()}</AlertTitle>
                {toast.message}
            </Alert>
        </Snackbar>
    );
};

export default Toast;
