import React from 'react';
import { Typography, Box, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

const Home: React.FC = () => {
  const navigate = useNavigate();

  const quickActions = [
    { title: 'Cadastrar Cliente', description: 'Adicionar novo cliente ao sistema', path: '/customers', color: '#1976d2' },
    { title: 'Gerenciar Produtos', description: 'Visualizar e editar produtos', path: '/products', color: '#388e3c' },
    { title: 'Registrar Venda', description: 'Criar nova venda', path: '/sales', color: '#f57c00' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Bem-vindo ao Janio ERP
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" paragraph>
        Sistema de gestão empresarial integrado
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {quickActions.map((action) => (
          <Grid item xs={12} md={4} key={action.path}>
            <Card sx={{ height: '100%', cursor: 'pointer' }} onClick={() => navigate(action.path)}>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {action.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {action.description}
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2, backgroundColor: action.color }}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(action.path);
                  }}
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Home;
