import React, { useState } from 'react';
import { Box, Paper, Tabs, Tab, Typography } from '@mui/material';
import InventoryPurchasesPage from './components/InventoryPurchasesSection';

const FinancialPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box p={2}>
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)} aria-label="tabs-financeiro" variant="scrollable">
          <Tab label="Contas a pagar" />
          <Tab label="Contas a receber" />
          <Tab label="Compras" />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <Box>
          <Typography color="text.secondary">Em breve: listagem de contas a pagar</Typography>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Typography color="text.secondary">Em breve: listagem de contas a receber</Typography>
        </Box>
      )}

      {tab === 2 && (
        <Box sx={{ p: { xs: 0, md: 0 } }}>
          <InventoryPurchasesPage />
        </Box>
      )}
    </Box>
  );
};

export default FinancialPage;
