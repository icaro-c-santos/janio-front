import React from 'react';
import { Box } from '@mui/material';
import Toast from './Toast';
import { useToast } from '../contexts/ToastContext';

const ToastContainer: React.FC = () => {
    const { toasts, removeToast } = useToast();

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 20,
                right: 20,
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
            }}
        >
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onClose={removeToast}
                />
            ))}
        </Box>
    );
};

export default ToastContainer;
