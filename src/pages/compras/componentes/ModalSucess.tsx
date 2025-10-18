import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Stack, Typography, Button, Link } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { PurchaseDetails } from '../../../services/purchasesService';

interface Props {
  open: boolean;
  details: PurchaseDetails | null;
  onClose: () => void;
}

const ModalSucess: React.FC<Props> = ({ open, details, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleOutlineIcon color="success" />
          <Typography variant="h6">Sucesso</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        {!details ? (
          <Typography>Deu tudo certo!</Typography>
        ) : (
          <Stack spacing={1}>
            <Typography><b>ID:</b> {details.id}</Typography>
            <Typography><b>Tipo:</b> {details.itemType}</Typography>
            <Typography><b>Fornecedor:</b> {details.supplierName || '-'} {details.supplierEmail ? `(${details.supplierEmail})` : ''}</Typography>
            <Typography><b>Quantidade:</b> {details.quantity}</Typography>
            <Typography><b>PU:</b> {Number(details.unitPrice).toFixed(2)}</Typography>
            <Typography><b>Total:</b> {Number(details.totalValue).toFixed(2)}</Typography>
            <Typography><b>Vencimento:</b> {new Date(details.purchaseDate).toLocaleDateString()}</Typography>
            {details.receiptDownloadUrl && (
              <Link href={details.receiptDownloadUrl} target="_blank" rel="noopener" underline="hover">Baixar PDF</Link>
            )}
          </Stack>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">OK</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalSucess;
