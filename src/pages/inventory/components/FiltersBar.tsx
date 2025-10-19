import React from 'react';
import { Stack, TextField, MenuItem, Button } from '@mui/material';

export interface InventoryFilters {
  itemType?: string;
  direction?: 'entrada' | 'saida';
  dateFrom?: string;
  dateTo?: string;
}

interface FiltersBarProps {
  filters: InventoryFilters;
  onChange: (filters: InventoryFilters) => void;
  onClear: () => void;
}

const FiltersBar: React.FC<FiltersBarProps> = ({ filters, onChange, onClear }) => {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
      <TextField
        select
        size="small"
        label="Tipo de Item"
        value={filters.itemType ?? ''}
        onChange={(e) => onChange({ ...filters, itemType: e.target.value || undefined })}
        sx={{ minWidth: 200 }}
      >
        <MenuItem value="">Todos</MenuItem>
        <MenuItem value="COCO">COCO</MenuItem>
        <MenuItem value="GARRAFA_DESCARTAVEL">GARRAFA_DESCARTAVEL</MenuItem>
        <MenuItem value="GARRAFA_REUTILIZAVEL">GARRAFA_REUTILIZAVEL</MenuItem>
        <MenuItem value="ROTULO">ROTULO</MenuItem>
        <MenuItem value="ETIQUETA">ETIQUETA</MenuItem>
        <MenuItem value="CLORO">CLORO</MenuItem>
      </TextField>

      <TextField
        select
        size="small"
        label="Direção"
        value={filters.direction ?? ''}
        onChange={(e) => onChange({ ...filters, direction: (e.target.value as any) || undefined })}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Todas</MenuItem>
        <MenuItem value="entrada">Entrada</MenuItem>
        <MenuItem value="saida">Saída</MenuItem>
      </TextField>

      <TextField
        size="small"
        label="De"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={filters.dateFrom ?? ''}
        onChange={(e) => onChange({ ...filters, dateFrom: e.target.value || undefined })}
      />

      <TextField
        size="small"
        label="Até"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={filters.dateTo ?? ''}
        onChange={(e) => onChange({ ...filters, dateTo: e.target.value || undefined })}
      />

      <Button variant="outlined" onClick={onClear}>Limpar</Button>
    </Stack>
  );
};

export default FiltersBar;
