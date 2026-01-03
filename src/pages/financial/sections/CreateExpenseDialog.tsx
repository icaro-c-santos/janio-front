import React, { useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Stack,
    MenuItem,
    Box,
    Alert,
    Typography,
    IconButton,
    Paper,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    CameraAlt as CameraIcon,
    PhotoLibrary as GalleryIcon,
    Close as CloseIcon,
    Delete as DeleteIcon,
    PictureAsPdf as PdfIcon,
    Image as ImageIcon,
    Cameraswitch as CameraSwitchIcon,
} from '@mui/icons-material';
import { ExpenseType, expensesService } from '../../../services/expensesService';

interface Props {
    open: boolean;
    onClose: () => void;
    types: ExpenseType[];
    onCreated: () => void;
}

const CreateExpenseDialog: React.FC<Props> = ({ open, onClose, types, onCreated }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [expenseTypeId, setExpenseTypeId] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [expenseDate, setExpenseDate] = useState('');
    const [receipt, setReceipt] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Camera states
    const [showCamera, setShowCamera] = useState(false);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!open) {
            reset();
            stopCamera();
        }
    }, [open]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    const reset = () => {
        setExpenseTypeId('');
        setDescription('');
        setAmount('');
        setExpenseDate('');
        setReceipt(null);
        setPreviewUrl(null);
        setError(null);
        setShowCamera(false);
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    };

    const startCamera = async () => {
        try {
            stopCamera();
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setShowCamera(true);
            setError(null);
        } catch (err) {
            setError('Não foi possível acessar a câmera. Verifique as permissões.');
            console.error('Camera error:', err);
        }
    };

    const switchCamera = async () => {
        const newMode = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(newMode);
        if (showCamera) {
            stopCamera();
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: newMode }
                });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Switch camera error:', err);
            }
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);

        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const file = new File([blob], `foto_${Date.now()}.jpg`, { type: 'image/jpeg' });
                    setReceipt(file);
                    setPreviewUrl(URL.createObjectURL(blob));
                    stopCamera();
                    setShowCamera(false);
                }
            },
            'image/jpeg',
            0.9
        );
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            setError('Arquivo deve ser PDF, PNG ou JPEG');
            return;
        }

        setReceipt(file);
        setError(null);

        if (file.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(file));
        } else {
            setPreviewUrl(null);
        }

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeReceipt = () => {
        setReceipt(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        try {
            const numericAmount = Number(amount);
            const validationErrors: string[] = [];

            if (!expenseTypeId) validationErrors.push('Tipo de despesa é obrigatório');
            if (!expenseDate) validationErrors.push('Data da despesa é obrigatória');
            if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
                validationErrors.push('Valor inválido');
            }

            if (validationErrors.length) {
                setError(validationErrors.join(' | '));
                setLoading(false);
                return;
            }

            await expensesService.create(
                {
                    expenseTypeId,
                    description: description.trim() || undefined,
                    amount: numericAmount,
                    expenseDate,
                },
                receipt
            );

            reset();
            onCreated();
        } catch (e: any) {
            setError(e?.message || 'Erro ao criar despesa');
        } finally {
            setLoading(false);
        }
    };

    const renderReceiptPreview = () => {
        if (!receipt) return null;

        const isPdf = receipt.type === 'application/pdf';

        return (
            <Paper
                variant="outlined"
                sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    bgcolor: 'grey.50',
                }}
            >
                {isPdf ? (
                    <PdfIcon sx={{ fontSize: 40, color: 'error.main' }} />
                ) : previewUrl ? (
                    <Box
                        component="img"
                        src={previewUrl}
                        alt="Preview"
                        sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 1,
                        }}
                    />
                ) : (
                    <ImageIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                )}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" noWrap>
                        {receipt.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {(receipt.size / 1024).toFixed(1)} KB
                    </Typography>
                </Box>
                <IconButton onClick={removeReceipt} size="small" color="error">
                    <DeleteIcon />
                </IconButton>
            </Paper>
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                Cadastrar Despesa
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                {showCamera ? (
                    <Box sx={{ position: 'relative' }}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{
                                width: '100%',
                                maxHeight: '60vh',
                                objectFit: 'cover',
                                borderRadius: 8,
                                backgroundColor: '#000',
                            }}
                        />
                        <canvas ref={canvasRef} style={{ display: 'none' }} />

                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 16,
                                left: 0,
                                right: 0,
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 2,
                            }}
                        >
                            <IconButton
                                onClick={() => {
                                    stopCamera();
                                    setShowCamera(false);
                                }}
                                sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                            >
                                <CloseIcon />
                            </IconButton>

                            <IconButton
                                onClick={capturePhoto}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    width: 64,
                                    height: 64,
                                    '&:hover': { bgcolor: 'primary.dark' },
                                }}
                            >
                                <CameraIcon fontSize="large" />
                            </IconButton>

                            <IconButton
                                onClick={switchCamera}
                                sx={{ bgcolor: 'rgba(255,255,255,0.9)' }}
                            >
                                <CameraSwitchIcon />
                            </IconButton>
                        </Box>
                    </Box>
                ) : (
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            select
                            label="Tipo de Despesa"
                            value={expenseTypeId}
                            onChange={(e) => setExpenseTypeId(e.target.value)}
                            required
                            fullWidth
                        >
                            {types.length === 0 ? (
                                <MenuItem disabled>Nenhum tipo cadastrado</MenuItem>
                            ) : (
                                types.map((t) => (
                                    <MenuItem key={t.id} value={t.id}>
                                        {t.name}
                                    </MenuItem>
                                ))
                            )}
                        </TextField>

                        <TextField
                            label="Descrição (opcional)"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            multiline
                            rows={2}
                        />

                        <TextField
                            label="Valor"
                            type="number"
                            inputProps={{ step: '0.01', min: '0' }}
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            required
                            fullWidth
                        />

                        <TextField
                            label="Data da Despesa"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                            required
                            fullWidth
                        />

                        {/* Receipt Section */}
                        <Box>
                            <Typography variant="subtitle2" gutterBottom color="text.secondary">
                                Comprovante (opcional)
                            </Typography>

                            {receipt ? (
                                renderReceiptPreview()
                            ) : (
                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<CameraIcon />}
                                        onClick={startCamera}
                                        sx={{ flex: 1 }}
                                    >
                                        Tirar Foto
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<GalleryIcon />}
                                        component="label"
                                        sx={{ flex: 1 }}
                                    >
                                        Importar
                                        <input
                                            ref={fileInputRef}
                                            hidden
                                            type="file"
                                            accept="application/pdf,image/png,image/jpeg,image/jpg"
                                            onChange={handleFileSelect}
                                        />
                                    </Button>
                                </Stack>
                            )}

                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Aceita: PDF, PNG ou JPEG
                            </Typography>
                        </Box>

                        {error && <Alert severity="error">{error}</Alert>}
                    </Stack>
                )}
            </DialogContent>

            {!showCamera && (
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </DialogActions>
            )}
        </Dialog>
    );
};

export default CreateExpenseDialog;

