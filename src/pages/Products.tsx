import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const Products: React.FC = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Produtos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Novo Produto
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Gerenciamento de Produtos
        </Typography>
        <Typography color="text.secondary">
          Esta funcionalidade será implementada em breve. Aqui você poderá:
        </Typography>
        <ul>
          <li>Cadastrar novos produtos</li>
          <li>Visualizar lista de produtos</li>
          <li>Editar informações dos produtos</li>
          <li>Definir preços por cliente</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default Products;
